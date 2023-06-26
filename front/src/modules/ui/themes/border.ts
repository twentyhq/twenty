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
  },
  ...common,
};

export const borderDark = {
  color: {
    strong: grayScale.gray60,
    medium: grayScale.gray65,
    light: grayScale.gray70,
  },
  ...common,
};
