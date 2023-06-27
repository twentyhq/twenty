import { grayScale } from './colors';

const common = {
  size: {
    xs: '0.85rem',
    sm: '0.92rem',
    md: '1rem',
    lg: '1.23rem',
    xl: '1.54rem',
    xxl: '1.85rem',
  },
  weight: {
    regular: 400,
    medium: 500,
    semiBold: 600,
  },
  family: 'Inter, sans-serif',
};

export const fontLight = {
  color: {
    primary: grayScale.gray55,
    secondary: grayScale.gray45,
    tertiary: grayScale.gray40,
    light: grayScale.gray35,
    extraLight: grayScale.gray30,
    inverted: grayScale.gray0,
  },
  ...common,
};

export const fontDark = {
  color: {
    primary: grayScale.gray30,
    secondary: grayScale.gray40,
    tertiary: grayScale.gray45,
    light: grayScale.gray50,
    extraLight: grayScale.gray55,
    inverted: grayScale.gray100,
  },
  ...common,
};
