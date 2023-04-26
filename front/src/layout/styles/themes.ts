import { css } from '@emotion/react';
import DarkNoise from './dark-noise.jpg';
import LightNoise from './light-noise.jpg';

const commonTheme = {
  fontSizeExtraSmall: '0.85rem',
  fontSizeSmall: '0.92rem',
  fontSizeMedium: '1rem',
  fontSizeLarge: '1.08rem',

  iconSizeSmall: '0.92rem',
  iconSizeMedium: '1.08rem',
  iconSizeLarge: '1.23rem',

  fontWeightBold: 500,

  spacing: (multiplicator: number) => `${multiplicator * 4}px`,
};

const lightThemeSpecific = {
  noisyBackground: `url(${LightNoise.toString()});`,
  primaryBackground: '#fff',
  secondaryBackground: '#fcfcfc',
  tertiaryBackground: '#f5f5f5',
  pinkBackground: '#ffe5f4',
  greenBackground: '#e6fff2',
  purpleBackground: '#e0e0ff',
  yellowBackground: '#fff2e7',

  secondaryBackgroundSmallTransparency: 'rgba(252, 252, 252, 0.8)',

  primaryBorder: 'rgba(0, 0, 0, 0.08)',

  text100: '#000',
  text80: '#333333',
  text60: '#666',
  text40: '#999999',
  text30: '#b3b3b3',
  text20: '#cccccc',
  text0: '#fff',

  blue: '#1961ed',
  pink: '#cc0078',
  green: '#1e7e50',
  purple: '#1111b7',
  yellow: '#cc660a',

  blueHighTransparency: 'rgba(25, 97, 237, 0.03)',
  blueLowTransparency: 'rgba(25, 97, 237, 0.32)',
};

const darkThemeSpecific: typeof lightThemeSpecific = {
  noisyBackground: `url(${DarkNoise.toString()});`,
  primaryBackground: '#141414',
  secondaryBackground: '#171717',
  tertiaryBackground: '#333333',
  pinkBackground: '#cc0078',
  greenBackground: '#1e7e50',
  purpleBackground: '#1111b7',
  yellowBackground: '#cc660a',

  secondaryBackgroundSmallTransparency: 'rgba(23, 23, 23, 0.8)',

  primaryBorder: 'rgba(255, 255, 255, 0.08)',

  text100: '#ffffff',
  text80: '#cccccc',
  text60: '#999',
  text40: '#666',
  text30: '#4c4c4c',
  text20: '#333333',
  text0: '#000',

  blue: '#6895ec',
  pink: '#ffe5f4',
  green: '#e6fff2',
  purple: '#e0e0ff',
  yellow: '#fff2e7',

  blueHighTransparency: 'rgba(104, 149, 236, 0.03)',
  blueLowTransparency: 'rgba(104, 149, 236, 0.32)',
};

export const modalBackground = (props: any) =>
  css`
    backdrop-filter: blur(20px);
    background: ${props.theme.secondaryBackgroundSmallTransparency};
  `;

export const lightTheme = { ...commonTheme, ...lightThemeSpecific };
export const darkTheme = { ...commonTheme, ...darkThemeSpecific };

export type ThemeType = typeof lightTheme;
