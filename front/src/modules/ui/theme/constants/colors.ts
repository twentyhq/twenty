/* eslint-disable twenty-ts/no-hardcoded-colors */
import hexRgb from 'hex-rgb';

export const grayScale = {
  gray100: '#000000',
  gray90: '#141414',
  gray85: '#171717',
  gray80: '#1b1b1b',
  gray75: '#1d1d1d',
  gray70: '#222222',
  gray65: '#292929',
  gray60: '#333333',
  gray55: '#4c4c4c',
  gray50: '#666666',
  gray45: '#818181',
  gray40: '#999999',
  gray35: '#b3b3b3',
  gray30: '#cccccc',
  gray25: '#d6d6d6',
  gray20: '#ebebeb',
  gray15: '#f1f1f1',
  gray10: '#fcfcfc',
  gray0: '#ffffff',
};

export const mainColors = {
  yellow: '#ffd338',
  green: '#55ef3c',
  turquoise: '#15de8f',
  sky: '#00e0ff',
  blue: '#1961ed',
  purple: '#915ffd',
  pink: '#f54bd0',
  red: '#f83e3e',
  orange: '#ff7222',
  gray: grayScale.gray30,
};

export type ThemeColor = keyof typeof mainColors;

export const secondaryColors = {
  yellow80: '#2e2a1a',
  yellow70: '#453d1e',
  yellow60: '#746224',
  yellow50: '#b99b2e',
  yellow40: '#ffe074',
  yellow30: '#ffedaf',
  yellow20: '#fff6d7',
  yellow10: '#fffbeb',

  green80: '#1d2d1b',
  green70: '#23421e',
  green60: '#2a5822',
  green50: '#42ae31',
  green40: '#88f477',
  green30: '#ccfac5',
  green20: '#ddfcd8',
  green10: '#eefdec',

  turquoise80: '#172b23',
  turquoise70: '#173f2f',
  turquoise60: '#166747',
  turquoise50: '#16a26b',
  turquoise40: '#5be8b1',
  turquoise30: '#a1f2d2',
  turquoise20: '#d0f8e9',
  turquoise10: '#e8fcf4',

  sky80: '#152b2e',
  sky70: '#123f45',
  sky60: '#0e6874',
  sky50: '#07a4b9',
  sky40: '#4de9ff',
  sky30: '#99f3ff',
  sky20: '#ccf9ff',
  sky10: '#e5fcff',

  blue80: '#171e2c',
  blue70: '#172642',
  blue60: '#18356d',
  blue50: '#184bad',
  blue40: '#5e90f2',
  blue30: '#a3c0f8',
  blue20: '#d1dffb',
  blue10: '#e8effd',

  purple80: '#231e2e',
  purple70: '#2f2545',
  purple60: '#483473',
  purple50: '#6c49b8',
  purple40: '#b28ffe',
  purple30: '#d3bffe',
  purple20: '#e9dfff',
  purple10: '#f4efff',

  pink80: '#2d1c29',
  pink70: '#43213c',
  pink60: '#702c61',
  pink50: '#b23b98',
  pink40: '#f881de',
  pink30: '#fbb7ec',
  pink20: '#fddbf6',
  pink10: '#feedfa',

  red80: '#2d1b1b',
  red70: '#441f1f',
  red60: '#712727',
  red50: '#b43232',
  red40: '#fa7878',
  red30: '#fcb2b2',
  red20: '#fed8d8',
  red10: '#feecec',

  orange80: '#2e2018',
  orange70: '#452919',
  orange60: '#743b1b',
  orange50: '#b9571f',
  orange40: '#ff9c64',
  orange30: '#ffc7a7',
  orange20: '#ffe3d3',
  orange10: '#fff1e9',

  gray80: grayScale.gray70,
  gray70: grayScale.gray65,
  gray60: grayScale.gray55,
  gray50: grayScale.gray40,
  gray40: grayScale.gray25,
  gray30: grayScale.gray20,
  gray20: grayScale.gray15,
  gray10: grayScale.gray10,
  blueAccent90: '#141a25',
  blueAccent85: '#151d2e',
  blueAccent80: '#152037',
  blueAccent75: '#16233f',
  blueAccent70: '#17294a',
  blueAccent60: '#18356d',
  blueAccent40: '#a3c0f8',
  blueAccent35: '#c8d9fb',
  blueAccent25: '#dae6fc',
  blueAccent20: '#e2ecfd',
  blueAccent15: '#edf2fe',
  blueAccent10: '#f5f9fd',
};

export const color = {
  ...mainColors,
  ...secondaryColors,
};

export const rgba = (hex: string, alpha: number) => {
  const rgb = hexRgb(hex, { format: 'array' }).slice(0, -1).join(',');
  return `rgba(${rgb},${alpha})`;
};
