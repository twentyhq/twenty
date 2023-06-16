import DarkNoise from '../assets/dark-noise.jpg';
import LightNoise from '../assets/light-noise.jpg';

export const backgroundColorsLight = {
  noisyBackground: `url(${LightNoise.toString()});`,
  primaryBackground: '#fff',
  secondaryBackground: '#fcfcfc',
  tertiaryBackground: '#f5f5f5',
  quaternaryBackground: '#ebebeb',
};

export const backgroundColorsDark = {
  noisyBackground: `url(${DarkNoise.toString()});`,
  primaryBackground: '#141414',
  secondaryBackground: '#171717',
  tertiaryBackground: '#1B1B1B',
  quaternaryBackground: '#1D1D1D',
};
