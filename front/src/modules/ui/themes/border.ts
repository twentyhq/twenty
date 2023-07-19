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
    strong: grayScale.gray20,
    medium: grayScale.gray15,
    light: grayScale.gray10,
    inverted: grayScale.gray60,
  },
  ...common,
};

export const borderDark = {
  color: {
    strong: grayScale.gray65,
    medium: grayScale.gray70,
    light: grayScale.gray75,
    inverted: grayScale.gray25,
  },
  ...common,
};
