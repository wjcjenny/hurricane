
$(document).ready(function(){
	"use strict";
var pymChild = pym.Child({ polling: 500 });



	var dataChart;
	var levelDiv;
	var levelId;
	
	// buttons 
	$('.bttn').click(function() {
		$( ".bttn" ).removeClass( 'active');
		$( this ).addClass( 'active');


		if ($(this).attr('id') == "rect0") {
			dataChart = "data/crisis-data-5a.csv";
			levelDiv = "<div id='mapbox-5a'></div>";
			levelId = "#mapbox-5a";
			$('#mapbox').html();
			$('#mapbox').html(levelDiv);
			drawMap();
			loading();
		}else if($(this).attr('id') == "rect1"){
			dataChart = "data/crisis-data-5b.csv";
			levelDiv = "<div id='mapbox-5b'></div>";
			levelId = "#mapbox-5b";
			$('#mapbox').html();
			$('#mapbox').html(levelDiv);
			drawMap();
			loading();
		}else if($(this).attr('id') == "rect2"){
			dataChart = "data/crisis-data-5c.csv";
			levelDiv = "<div id='mapbox-5c'></div>";
			levelId = "#mapbox-5c";
			$('#mapbox').html();
			$('#mapbox').html(levelDiv);
			drawMap();
			loading();
		}
	});

	$('#rect0').trigger("click");

	// below is MAPPPPPPPP
	function drawMap(){	
		
		d3.select(window)
			   .on("resize", sizeChange);

		// Set Projection Parameters
		var albersProjection = d3.geoAlbers()
		    .scale( 4500 )
		    .center( [2.36, 28.8] );

		// Create GeoPath function that uses built-in D3 functionality to turn
		// lat/lon coordinates into screen coordinates
		var geoPath = d3.geoPath()
		    .projection( albersProjection );


		// Width and Height of the whole visualization
		var color = d3.scaleLinear()
				    .domain([-1000,5,100,500,1000,2000,3000])
				    // .range(["#3062FF","#2B87E3", "#FBA849", "#FF503C", "#D93757"]);
				    // .range(["#a3d1ff","#7b9ec5", "#556d8e","#30415b","#1d2738",""]);
					.range(["#96daff","#81b9dd","#6c99bc","#587a9b","#445d7a","#30415b"])
		// Create SVG
		var svg = d3.select( levelId )
		    .append( "svg" )
		    .attr('class', 'svgMap')
		    .attr("width", "100%")
			.append("g");

		// Append Div for tooltip to SVG
		var div = d3.select(levelId)
			    .append("div")   
	    		.attr("class", "tooltip")
	    		.style("opacity", 0);

		d3.csv(dataChart, function(data) {
			color.domain([-1000,5,100,500,1000,2000,3000]); // setting the range of the input data
		
			d3.json("data/output.json", function(error, json) {
				if (error) throw error;
				
				// combine csv and topo
				var topoDistrict = topojson.feature(json, json.objects.Current_Districts)

				for (var i = 0; i < data.length; i++) {

					// Grab school distric name from csv
					var csvDistrict = data[i].DISTRICT;

					// Grab school distric value from csv 
					var csvCrisis = data[i].CRISIS_IND;
					var csvCrisisStudent = data[i].studentnumber;
					var csvTipcat = data[i].tipcat;

					// Find the corresponding district inside the topoJson
					for (var j = 0; j < topoDistrict.features.length; j++)  {
						var jsonDistrict = topoDistrict.features[j].properties.DISTRICT_N;
						// console.log(topoDistrict.features[1].properties)
						if (csvDistrict == jsonDistrict) {

						// Copy the data value into the JSON
						topoDistrict.features[j].properties.schoollevel = csvCrisis;
						topoDistrict.features[j].properties.studentnumber = csvCrisisStudent;
						topoDistrict.features[j].properties.tipcat = csvTipcat;
						// Stop looking through the JSON
						break;
						}
					}
				}

				// data ready for use
				// console.log("THIS IS THE DATA FOR COLOR:", topoDistrict.features)
				
				var imgs = svg.selectAll("image").data([0]);
			    
			    imgs.enter()
			        .append('svg:image')
			        .attr('class','insetmap')
					.attr('x', 450)
					.attr('y', 350)
					.attr('width', 120)
					.attr('height', 120)
					.attr('xlink:href', 'img/inset.png')
					.style('isolation','isolate')

				svg.append('text')
			        .attr('x', 320)
					.attr('y', 380)
					.attr('class','insettext')
			        .attr('text-anchor', 'middle')
			        .text('Gulf of Mexico');

				// Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
				svg.selectAll( "path" )
				    .data( topoDistrict.features )
				    .enter()
				    .append( "path" )
				    .attr( "d", geoPath )
				    .style("fill", function(d) {
						if(d.properties.studentnumber){
							return color(d.properties.studentnumber);
						}else{
							return "#dedede";
						}
					})
				    .attr( "stroke", "#fff")
				    .on("mouseover", function(d) { 
				    	div.transition()
				    		.duration(500)
				    		.style("opacity", .9);

				        //parse data with comma
						var formatComma = d3.format(",")
						
				        div.html(function(){
				        	if (d.properties.studentnumber > 0){
				        		return "<p><span class='focusnumber'>" + formatComma(d.properties.studentnumber) +"</span> students were "+d.properties.tipcat+" in <span class='focusstate'>"+d.properties.NAME+"</span>.</p>"
				        	}else if(d.properties.studentnumber < 0){
				        		return "<p><span class='focusnumber'>Less than 5</span> students were "+d.properties.tipcat+" in <span class='focusstate'>"+d.properties.NAME+"</span>.</p>"
				        	}
				        })
				        .style("left", function(d){
				        	if($(window).width() < 629){
				        		 return ((d3.event.pageX + 20) + "px")
				        	} else{
				        		return ((d3.event.pageX - 75) + "px")
				        	}
				        })
				        .style("top", function(d){
				        	if($(window).width() < 629){
				        		 return ((d3.event.pageY - 185) + "px")
				        	} else{
				        		return ((d3.event.pageY - 125) + "px")
				        	}
				        });
			           // .style("left", (d3.event.pageX - 75) + "px")     
			           // .style("top", (d3.event.pageY - 125) + "px");    
					})                 
				    .on("mouseout", function(d) {       
				        div.transition()        
				           .duration(500)
				           .style("opacity", 0);  
				    });
					

			});
		});

		function sizeChange() {
		    d3.select("g")
		    	.attr("transform", "scale(" + $(levelId)
		    	.width()/600 + ")");
		    $(".svgMap").height($(levelId).width()*0.9);
		}
	}
	
	function loading(){
		d3.select("g")
		.attr("transform", "scale(" + $(levelId)
		.width()/600 + ")");
		$(".svgMap").height($(levelId).width()*0.9);
	}

pymChild.sendHeight();  
$(window).resize( function() { pymChild.sendHeight() })


});