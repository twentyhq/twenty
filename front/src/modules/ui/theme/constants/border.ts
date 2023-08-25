import { color, grayScale } from './colors';

const common = {
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    rounded: '100%',
  },
};

export const borderLight = {
  color: {
    strong: grayScale.gray25,
    medium: grayScale.gray20,
    light: grayScale.gray15,
    secondaryInverted: grayScale.gray50,
    inverted: grayScale.gray60,
    danger: color.red20,
  },
  ...common,
};

export const borderDark = {
  color: {
    strong: grayScale.gray55,
    medium: grayScale.gray65,
    light: grayScale.gray70,
    secondaryInverted: grayScale.gray35,
    inverted: grayScale.gray20,
    danger: color.red70,
  },
  ...common,
};
