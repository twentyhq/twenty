import DarkNoise from '../assets/dark-noise.jpg';
import LightNoise from '../assets/light-noise.png';

import { color, grayScale, rgba } from './colors';

export const backgroundLight = {
  noisy: `url(${LightNoise.toString()});`,
  primary: grayScale.gray0,
  secondary: grayScale.gray10,
  tertiary: grayScale.gray15,
  quaternary: grayScale.gray20,
  danger: color.red10,
  transparent: {
    primary: rgba(grayScale.gray0, 0.8),
    secondary: rgba(grayScale.gray10, 0.8),
    strong: rgba(grayScale.gray100, 0.16),
    medium: rgba(grayScale.gray100, 0.08),
    light: rgba(grayScale.gray100, 0.04),
    lighter: rgba(grayScale.gray100, 0.02),
    danger: rgba(color.red, 0.08),
  },
  overlay: rgba(grayScale.gray80, 0.8),
  radialGradient: `radial-gradient(50% 62.62% at 50% 0%, #505050 0%, ${grayScale.gray60} 100%)`,
  radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, #505050 0%, ${grayScale.gray60} 100%)`,
};

export const backgroundDark = {
  noisy: `url(${DarkNoise.toString()});`,
  primary: grayScale.gray85,
  secondary: grayScale.gray80,
  tertiary: grayScale.gray75,
  quaternary: grayScale.gray70,
  danger: color.red80,
  transparent: {
    primary: rgba(grayScale.gray85, 0.8),
    secondary: rgba(grayScale.gray80, 0.8),
    strong: rgba(grayScale.gray0, 0.14),
    medium: rgba(grayScale.gray0, 0.1),
    light: rgba(grayScale.gray0, 0.06),
    lighter: rgba(grayScale.gray0, 0.03),
    danger: rgba(color.red, 0.08),
  },
  overlay: rgba(grayScale.gray80, 0.8),
  radialGradient: grayScale.gray0,
  radialGradientHover: grayScale.gray15,
};
