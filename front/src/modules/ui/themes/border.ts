import { grayScale } from './colors';

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
  },
  ...common,
};

export const borderDark = {
  color: {
    strong: grayScale.gray65,
    medium: grayScale.gray70,
    light: grayScale.gray75,
    secondaryInverted: grayScale.gray40,
    inverted: grayScale.gray30,
  },
  ...common,
};
