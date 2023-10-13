import { color, grayScale } from './colors';

const common = {
  size: {
    xxs: '0.625rem',
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
    primary: grayScale.gray60,
    secondary: grayScale.gray50,
    tertiary: grayScale.gray40,
    light: grayScale.gray35,
    extraLight: grayScale.gray30,
    inverted: grayScale.gray0,
    danger: color.red,
  },
  ...common,
};

export const fontDark = {
  color: {
    primary: grayScale.gray20,
    secondary: grayScale.gray35,
    tertiary: grayScale.gray45,
    light: grayScale.gray50,
    extraLight: grayScale.gray55,
    inverted: grayScale.gray100,
    danger: color.red,
  },
  ...common,
};
