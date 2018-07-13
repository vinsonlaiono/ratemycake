const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public/dist/public'));

app.listen(port, function () {
    console.log("You are listening on port 5000")
})
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/RateMyCake');
var RatingSchema = new mongoose.Schema({
    rating: { type: Number, required: [true, "No way"] },
    review: { type: String, required: [true, "Review Cannot be empty"], minlength: 1 },
}, { timestamps: true });

var CakeSchema = new mongoose.Schema({
    baker_name: { type: String, required: [true, "title must be at least 2 characters"] },
    image_url: { type: String, default: '', required: [true, "Please eneter a valid URL"] },
    cake_rating: [RatingSchema],
    avg_rating: {type: Number}
}, { timestamps: true });

const Rating = mongoose.model('Rating', RatingSchema)

const Cake = mongoose.model('Cake', CakeSchema);

// retrieve all Cakes
app.get('/cakes', (req, res) => {
    console.log("Retrieve all cakes route")
    Cake.find({}, function (err, cakes) {
        if (err) {
            console.log("Error: ", err)
            res.json({ message: "Error", error: err })
        } else {
            res.json({ message: "Success", data: cakes })
        }
    })
})
// Retrieve a cake by ID
app.get('/cake/:id/', (req, res) => {
    console.log("Retrieve a single cake route------")
    Cake.findOne({ _id: req.params.id }, function (err, cake) {
        if (err) {
            console.log({ message: "Error", error: err })
            res.json({ message: "Error", data: err })
        } else {
            res.json({ message: "Success", data: cake })
        }
    })
});
// Create a Cake
app.post('/cake', function (req, res) {
    console.log("Create a single cake route")
    console.log(req.body)
    Cake.create({
        baker_name: req.body.baker_name, image_url: req.body.image_url
    }, function (err, cake) {
        if (err) {
            console.log(err)
            res.json({ message: "Error", error: err })
        } else {
            res.json({ message: "Success", data: cake })
        }
    })
});
// Create a rating
app.post('/review/:cake_id', (req, res) => {
    console.log(req.body)
    Cake.findByIdAndUpdate(req.params.cake_id, { $push: { cake_rating: { rating: req.body.rating, review: req.body.review } } })
        .then((data) => res.json({ messageg: "Sucessfully added a rating", data: data }))
        .catch((err) => res.json(({err})))
})
app.delete('/delete/:id', function(req, res){
    Cake.findByIdAndRemove(req.params.id, function(err, cake){
        res.json({cake})
    })
})