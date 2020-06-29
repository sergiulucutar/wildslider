import React, { Component } from 'react';
import { gsap, TweenLite } from 'gsap';
import { Draggable } from 'gsap/all';

import './Slider.scss';
import arrow from '../assets/arrow.svg';

gsap.registerPlugin(Draggable);

const apiUrl = '/cms/api/collections/get/slide';

class Slider extends Component {
  constructor() {
    super();

    this.wrapperRef = null;

    this.state = {
      index: 0,
      slides: []
    };
  }

  componentDidMount() {
    console.log(process.env);
    fetch(`${process.env.REACT_APP_API_HOST}${apiUrl}`)
      .then(rsp => rsp.json())
      .then(({ entries }) => this.setState({ slides: entries }))
      .then(() => {
        const that = this;
        const offsetWidth = this.wrapperRef.offsetWidth;

        Draggable.create('.Slider_wrapper', {
          type: 'x',
          bounds: {
            // one slide is always shown -> substract 1 from lenth
            left: -offsetWidth * (that.state.slides.length - 1),
            width: offsetWidth * that.state.slides.length
          },
          onPress: function () {
            // save the 'distance' that has already been dragged
            this.offset = this.x - gsap.getProperty(this.target, 'x');
            TweenLite.killTweensOf(this.target);
          },
          onRelease: function () {
            const newIndex =
              this.deltaX > 0
                ? Math.ceil(this.x / offsetWidth)
                : Math.floor(this.x / offsetWidth);

            that.setState({
              index: -newIndex
            });
            TweenLite.to(this.target, 0.3, {
              x: newIndex * offsetWidth
            });
          }
        });
      });
  }

  handleControlsEvent(delta = 1) {
    this.setState({ index: this.state.index + delta }, () => {
      TweenLite.to(this.wrapperRef, 0.3, {
        x: -this.state.index * this.wrapperRef.offsetWidth
      });
    });
  }

  render() {
    const slideIndexes = [];
    for (let i = 0; i < this.state.slides.length; i++) {
      slideIndexes.push(
        <span key={i} className={this.state.index < i ? 'hide' : ''}></span>
      );
    }

    return (
      <section className='Slider'>
        <div className='Slider_wrapper' ref={el => (this.wrapperRef = el)}>
          {this.state.slides.map((slide, index) => (
            <div
              className='slide'
              key={index}
              style={{
                backgroundImage: `url(${process.env.REACT_APP_API_HOST}${slide.image.path})`
              }}
            ></div>
          ))}
        </div>
        <div className='Slider_indexes'>{slideIndexes}</div>
        <div className='Slider_controls'>
          <button
            disabled={this.state.index === 0}
            onClick={this.handleControlsEvent.bind(this, -1)}
          >
            <img src={arrow} alt='PREV'></img>
          </button>
          <button
            disabled={this.state.index === this.state.slides.length - 1}
            onClick={this.handleControlsEvent.bind(this, 1)}
          >
            <img src={arrow} alt='NEXT'></img>
          </button>
        </div>
      </section>
    );
  }
}

export default Slider;
