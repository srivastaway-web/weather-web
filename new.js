import countryCodeToName from "./codeToCountry.js";





const apiKey = "379b09d743de7eac2614006277f91717"; // Your OpenWeather API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const airPollutionUrl = "https://api.openweathermap.org/data/2.5/air_pollution?&appid=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const oneCallUrl = "https://api.openweathermap.org/data/2.5/onecall?&exclude=current,minutely,daily&units=metric&appid=";

const searchBox = document.querySelector(".search-text");
const searchBtn = document.querySelector(".search-button");
const weatherIcon = document.querySelector(".weath-icon");


let buttonIsPressed= false;



// function for weather check 
async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    // Error handling for 400 or 404 response codes
    if (response.status === 400 || response.status === 404) {
        document.querySelector('.error').style.display = 'block';
        document.querySelector('.weather').style.display = 'none';
        return;
    }

    const data = await response.json();
    console.log("Current Weather Data: ", data); // Log data to console

    // Display weather information
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".country").innerHTML = `${countryCodeToName[data.sys.country]}`;
    document.querySelector(".temperature").innerHTML = `${data.main.temp}°C`;
    document.querySelector(".humidity").innerHTML = `Humidity: ${data.main.humidity}%`;
    document.querySelector(".pressure").innerHTML = `Pressure: ${data.main.pressure} hPa`;
    document.querySelector(".wind").innerHTML = `Wind: ${data.wind.speed} km/h`;
    document.querySelector(".cloudiness").innerHTML = `Cloudiness: ${data.clouds.all}%`;
    document.querySelector(".visibility").innerHTML = `Visibility: ${data.visibility/1000} km`;
    document.querySelector(".condition").innerHTML = `${data.weather[0].main} - ${data.weather[0].description}`;
    document.querySelector("#map-description").innerHTML = `<p>Condition:&nbsp;${data.weather[0].description}</p>`;
    document.querySelector("#coordinates").innerHTML = `<p>Latitude:&nbsp;${data.coord.lat}</p><br><p>Longitude:&nbsp;${data.coord.lon}</p>`;
    document.querySelector("#map-temperature").innerHTML = `<p>Temperature:&nbsp;${data.main.temp}°C`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Handle sunrise and sunset
    const sunriseData = timeUntilEvent(data.sys.sunrise);
    const sunsetData = timeUntilEvent(data.sys.sunset);

    document.querySelector(".sunrise").innerHTML = `Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
    document.querySelector(".sunset").innerHTML = `Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;
    document.querySelector(".sunrise-time").innerHTML = `${sunriseData.hours} hours ${sunriseData.minutes} minutes until sunrise`;
    document.querySelector(".sunset-time").innerHTML = `${sunsetData.hours} hours ${sunsetData.minutes} minutes until sunset`;

    // Get air pollution data and weather forecast
    const coordinates = { lat: data.coord.lat, lon: data.coord.lon };
    getAirPollutionData(coordinates.lat, coordinates.lon);
    getWeatherForecast(city);
    displayWeatherDataForClothing(data);
    displayMap(coordinates.lat,coordinates.lon);
    
}

// Function to calculate time until event (sunrise or sunset)
function timeUntilEvent(eventTimestamp) {
    const currentTime = new Date();
    const eventTime = new Date(eventTimestamp * 1000);

    if (eventTime > currentTime) {
        const timeDifference = eventTime - currentTime;
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes };
    } else {
        const timeDifference = currentTime - eventTime;
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes };
    }
}

// Function to fetch air pollution data
async function getAirPollutionData(lat, lon) {
    const response = await fetch(`${airPollutionUrl}${apiKey}&lat=${lat}&lon=${lon}`);
    
    if (response.status === 400 || response.status === 404) {
        console.log("Error fetching air pollution data");
        return;
    }

    const data = await response.json();
    console.log(data);
    const airPollution = data.list[0].components;
    document.querySelector(".aqi").innerHTML =`AQI: ${data.list[0].main.aqi}`;
    document.querySelector(".co").innerHTML = `CO: ${airPollution.co} µg/m³`;
    document.querySelector(".nh3").innerHTML = `NH3: ${airPollution.nh3} µg/m³`;
    document.querySelector(".no").innerHTML = `NO: ${airPollution.no} µg/m³`;
    document.querySelector(".no2").innerHTML = `NO2: ${airPollution.no2} µg/m³`;
    document.querySelector(".so2").innerHTML = `SO2: ${airPollution.so2} µg/m³`;
    document.querySelector(".o3").innerHTML = `O3: ${airPollution.o3} µg/m³`;
    document.querySelector(".pm25").innerHTML = `PM2.5: ${airPollution.pm2_5} µg/m³`;
    document.querySelector(".pm10").innerHTML = `PM10: ${airPollution.pm10} µg/m³`;
    
}

// Function to fetch weather forecast data
async function getWeatherForecast(city) {
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    
    if (response.status === 400 || response.status === 404) {
        console.log("Error fetching weather forecast");
        return;
    }

    const data = await response.json();
    console.log("Weather Forecast: ", data);

    const card = document.querySelectorAll(".forecast-card");
    const ind = { 0: 0, 8: 1, 16: 2, 24: 3, 32: 4 };

    data.list.forEach((item, index) => {
        if (index % 8 === 0) {
            const iconCode = item.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
            let forecastHTML = `
                <div>
                    <img src="${iconUrl}" alt="weather icon">
                    <p>${item.weather[0].description}</p>
                </div>
                <div>
                    <p>${item.main.temp}°C</p>
                    <p>${new Date(item.dt * 1000).toLocaleDateString()}</p>
                </div>`;
            
            card[ind[index]].innerHTML = forecastHTML;
        }
    });
}

// Function to display the map
async function displayMap(lat, lon) {
    console.log(lat,lon);
    var map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
        {
            maxZoom:19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map).bindPopup(`<b>Location:</b><br>Latitude: ${lat}<br>Longitude: ${lon}`).openPopup();

}


// Function to display the weather data and clothing recommendations
function displayWeatherDataForClothing(data) {
    const weatherDescription = data.weather[0].description;
    const temperature = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const recommendations = getClothingRecommendations(temperature, humidity, windSpeed, weatherDescription);
    displayClothingRecommendations(recommendations);
}

// Function to generate clothing recommendations based on the weather
function getClothingRecommendations(temp, humidity, windSpeed, weatherDescription) {
    let recommendations = [];

    if (temp <= 5) {
        recommendations.push("Wear a thick coat (fabric: wool or down) and gloves.");
        recommendations.push("Layer with thermal wear underneath.");
        recommendations.push("Add a scarf to protect your neck and face from the cold.");
        recommendations.push("Wear insulated boots to keep your feet warm.");
    } else if (temp > 5 && temp <= 15) {
        recommendations.push("Wear a medium-weight jacket (fabric: fleece or cotton).");
        recommendations.push("Consider wearing a sweater underneath.");
        recommendations.push("Wear a hat or beanie to keep your head warm.");
        recommendations.push("Wear boots or sturdy shoes for comfort and warmth.");
    } else if (temp > 15 && temp <= 25) {
        recommendations.push("Wear a light jacket or hoodie (fabric: cotton or polyester).");
        recommendations.push("Short-sleeve shirts are fine, but carry an extra layer in case it gets cooler.");
        recommendations.push("Wear breathable sneakers or comfortable shoes.");
        recommendations.push("Consider wearing a hat or cap for sun protection.");
        recommendations.push("You might also want to wear light leggings or casual pants.");
    } else {
        recommendations.push("Wear lightweight and breathable clothing like t-shirts and shorts.");
        recommendations.push("Consider wearing sunglasses and a hat for sun protection.");
        recommendations.push("Wear sandals, flip-flops, or breathable shoes.");
        recommendations.push("Don't forget sunscreen if you're going to be outdoors for a long period.");
        recommendations.push("Opt for a wide-brimmed hat to protect yourself from the sun.");
    }
    
    if (humidity > 80) {
        recommendations.push("Opt for moisture-wicking fabrics like polyester or merino wool.");
        recommendations.push("Wear light, breathable fabrics like linen or cotton.");
        recommendations.push("Consider wearing a loose-fitting outfit to allow air circulation.");
    }
    
    if (windSpeed > 20) {
        recommendations.push("Bring a windbreaker jacket to protect from strong winds.");
        recommendations.push("Consider wearing a hooded jacket or sweater to cover your head.");
        recommendations.push("Wear wind-resistant fabrics to protect against gusts.");
    }
    
    if (weatherDescription.includes("rain")) {
        recommendations.push("Don't forget an umbrella or waterproof jacket.");
        recommendations.push("Wear waterproof shoes or boots to keep your feet dry.");
        recommendations.push("Consider wearing a rain hat or cap to shield your face from rain.");
    }
    
    if (weatherDescription.includes("snow")) {
        recommendations.push("Wear snow-resistant boots and a thicker winter coat.");
        recommendations.push("Wear a snow hat or earmuffs to protect your ears.");
        recommendations.push("Consider adding a woolen or knitted scarf for extra warmth.");
        recommendations.push("Wear insulated gloves or mittens to keep your hands warm.");
    }
    
    
    return recommendations;
}

// Function to display the clothing recommendations
function displayClothingRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('clothing-recommendations');
    recommendationsContainer.innerHTML = ''; // Clear previous recommendations

    recommendations.forEach((rec) => {
        const listItem = document.createElement('li');
        listItem.textContent = rec;
        recommendationsContainer.appendChild(listItem);
    });
}

// menu target element js 
// const targetWlcmPage = document.querySelector('.menu p:nth-child(1)');
// const targetWeath = document.querySelector('.menu p:nth-child(2)');
// const targetMap = document.querySelector('.menu p:nth-child(3)');
// const targetSaved = document.querySelector('.menu p:nth-child(4)');

// const targetCont=document.querySelectorAll('.target-content');

// function toggleDisplay(counter){
//     targetCont.forEach((item)=>{
//         item.style.display='none';
//     })
//     console.log(targetCont[counter]);
//     targetCont[counter].style.display='block';
// };

// targetWlcmPage.addEventListener('onclick',toggleDisplay(0));
// targetWeath.addEventListener('onclick',toggleDisplay(1));
// targetMap.addEventListener('onclick',toggleDisplay(2));
// targetSaved.addEventListener('onclick', toggleDisplay(3));

const menuItems=document.querySelectorAll('.menu-item');
const contItems=document.querySelectorAll('.target-content');
const noButtonContent=document.querySelector('.button-no');

// Create a new Date object to get the current date and time
const currentDate = new Date();

// Array of month names for formatting the date
const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Get the day of the month (1-31)
const day = currentDate.getDate();

// Get the month (0-11), use monthNames array to convert to 3-letter format
const month = monthNames[currentDate.getMonth()];

// Get the full year (e.g., 2025)
const year = currentDate.getFullYear();

// Format the date as `1JAN 2025`
const formattedDate = `${day}&nbsp;${month}&nbsp;<br>${year}`;

// Get the hours, minutes, and seconds
let hours = currentDate.getHours();
const minutes = String(currentDate.getMinutes()).padStart(2, '0'); 
const seconds = String(currentDate.getSeconds()).padStart(2, '0');

// Determine AM/PM and adjust hour format
const ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12; // Convert 24-hour format to 12-hour format
hours = hours ? hours : 12; // Adjust 0 hour (midnight) to 12

// Format the time as `hh:mm:ss AM/PM`
const formattedTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;

console.log(`Date: ${formattedDate}`);
console.log(`Time: ${formattedTime}`);
const datetag=document.querySelector('#date');
const timetag=document.querySelector('#time');


function toggle1(){
    datetag.innerHTML=`${formattedDate}`;
    datetime.innerHTML=`${formattedTime}`;
    menuItems[0].classList.toggle('active');
    if(menuItems[0].classList.contains('active')===true){
        // if one menu option is active then other will not be active 
        menuItems.forEach((item,index)=>{
            if(item.classList.contains('active')===true){
                if(index!== 0){
                    item.classList.toggle('active');
                }

            }
        })

        // Hide all content first
        contItems.forEach((content) => {
            content.style.display = 'none';
        });

        // Show the corresponding content
        contItems[0].style.display='block';
        
    }else if(!menuItems[0].classList.contains('active')===true){
        contItems.forEach((content) => {
            content.style.display = 'none';
        });
    }
    
   
}
function toggle2(){
    menuItems[1].classList.toggle('active');

    if(menuItems[1].classList.contains('active')===true){

        // if one menu option is active then other will not be active 
        menuItems.forEach((item,index)=>{
            if(item.classList.contains('active')===true){
                if(index!== 1){
                    item.classList.toggle('active');
                }

            }
        })
        console.log(buttonIsPressed);
        if(buttonIsPressed===true){

            noButtonContent.style.display='none';
            // Hide all content first
            contItems.forEach((content) => {
                content.style.display = 'none';
            });
        
            // Show the corresponding content
            contItems[1].style.display='block';
        }else{
                // Hide all content first
            contItems.forEach((content) => {
                content.style.display = 'none';
            });
            
            
            noButtonContent.style.display='block';
    
        }
    }else if(!menuItems[1].classList.contains('active')===true)
    {
        contItems[1].style.display='none';
        noButtonContent.style.display='none';

    }

}
function toggle3(){
    menuItems[2].classList.toggle('active');

    if(menuItems[2].classList.contains('active')===true){
        // if one menu option is active then other will not be active 
        menuItems.forEach((item,index)=>{
            if(item.classList.contains('active')===true){
                if(index!== 2){
                    item.classList.toggle('active');
                }

            }
        })
        console.log(buttonIsPressed);
        if(buttonIsPressed===true){

            noButtonContent.style.display='none';
            // Hide all content first
            contItems.forEach((content) => {
                content.style.display = 'none';
            });
        
            // Show the corresponding content
            contItems[2].style.display='block';
        }else{
                // Hide all content first
            contItems.forEach((content) => {
                content.style.display = 'none';
            });
            
            
            noButtonContent.style.display='block';
    
        }
    }else if(!menuItems[2].classList.contains('active')===true)
    {
        contItems[2].style.display='none';
        noButtonContent.style.display='none';

    }
    
}
function toggle4(){
    menuItems[3].classList.toggle('active');

    if(menuItems[3].classList.contains('active')===true){
        // if one menu option is active then other will not be active 
        menuItems.forEach((item,index)=>{
            if(item.classList.contains('active')===true){
                if(index!== 3){
                    item.classList.toggle('active');
                }

            }
        })
        console.log(buttonIsPressed);
        if(buttonIsPressed===true){

            noButtonContent.style.display='none';
            // Hide all content first
            contItems.forEach((content) => {
                content.style.display = 'none';
            });
        
            // Show the corresponding content
            contItems[3].style.display='block';
        }else{
                // Hide all content first
            contItems.forEach((content) => {
                content.style.display = 'none';
            });
            
            
            noButtonContent.style.display='block';
    
        }
    }else if(!menuItems[3].classList.contains('active')===true)
    {
        contItems[3].style.display='none';
        noButtonContent.style.display='none';

    }
}

let toggle=[toggle1,toggle2,toggle3,toggle4]

menuItems.forEach((item, index) => {
    document.addEventListener('DOMContentLoaded',()=>{ toggle1();})

    let tog = toggle[index];
    item.addEventListener('click', tog);



});




// Event listener for search button
searchBtn.addEventListener("click", () => {
    buttonIsPressed=true;
    const city = searchBox.value;
    checkWeather(city);
    toggle2();
});
