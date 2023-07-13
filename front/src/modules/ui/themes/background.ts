import DarkNoise from './assets/dark-noise.png';
import LightNoise from './assets/light-noise.png';
import { grayScale, rgba } from './colors';

export const backgroundLight = {
  noisy: `url(${LightNoise.toString()});`,
  primary: grayScale.gray0,
  secondary: grayScale.gray10,
  tertiary: grayScale.gray15,
  quaternary: grayScale.gray20,
  transparent: {
    primary: rgba(grayScale.gray0, 0.8),
    secondary: rgba(grayScale.gray10, 0.8),
    strong: rgba(grayScale.gray100, 0.16),
    medium: rgba(grayScale.gray100, 0.08),
    light: rgba(grayScale.gray100, 0.04),
    lighter: rgba(grayScale.gray100, 0.02),
  },
  overlay: rgba(grayScale.gray80, 0.8),
};

export const backgroundDark = {
  noisy: `url(${DarkNoise.toString()});`,
  primary: grayScale.gray85,
  secondary: grayScale.gray80,
  tertiary: grayScale.gray75,
  quaternary: grayScale.gray70,
  transparent: {
    primary: rgba(grayScale.gray85, 0.8),
    secondary: rgba(grayScale.gray80, 0.8),
    strong: rgba(grayScale.gray0, 0.09),
    medium: rgba(grayScale.gray0, 0.06),
    light: rgba(grayScale.gray0, 0.03),
    lighter: rgba(grayScale.gray0, 0.02),
  },
  overlay: rgba(grayScale.gray80, 0.8),
};
