import DarkNoise from './assets/dark-noise.png';
import LightNoise from './assets/light-noise.png';
import { grayScale, rgba } from './colors';

export const backgroundLight = {
  noisy: `url(${LightNoise.toString()});`,
  primary: grayScale.gray0,
  secondary: grayScale.gray5,
  tertiary: grayScale.gray10,
  quaternary: grayScale.gray15,
  transparent: {
    primary: rgba(grayScale.gray0, 0.8),
    secondary: rgba(grayScale.gray5, 0.8),
    strong: rgba(grayScale.gray100, 0.16),
    medium: rgba(grayScale.gray100, 0.08),
    light: rgba(grayScale.gray100, 0.04),
    lighter: rgba(grayScale.gray100, 0.02),
  },
  overlay: rgba(grayScale.gray85, 0.8),
};

export const backgroundDark = {
  noisy: `url(${DarkNoise.toString()});`,
  primary: grayScale.gray90,
  secondary: grayScale.gray85,
  tertiary: grayScale.gray80,
  quaternary: grayScale.gray75,
  transparent: {
    primary: rgba(grayScale.gray90, 0.8),
    secondary: rgba(grayScale.gray85, 0.8),
    strong: rgba(grayScale.gray0, 0.09),
    medium: rgba(grayScale.gray0, 0.06),
    light: rgba(grayScale.gray0, 0.03),
    lighter: rgba(grayScale.gray0, 0.02),
  },
  overlay: rgba(grayScale.gray85, 0.8),
};
