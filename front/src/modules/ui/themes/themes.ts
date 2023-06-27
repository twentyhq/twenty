import { backgroundDark, backgroundLight } from './background';
import { blur } from './blur';
import { borderDark, borderLight } from './border';
import { boxShadowDark, boxShadowLight } from './boxShadow';
import { color, grayScale } from './colors';
import { fontDark, fontLight } from './font';
import { icon } from './icon';
import { text } from './text';

const common = {
  color: color,
  grayScale: grayScale,
  icon: icon,
  text: text,
  blur: blur,
  spacing: (multiplicator: number) => `${multiplicator * 4}px`,
  table: {
    horizontalCellMargin: '8px',
    checkboxColumnWidth: '32px',
  },
  rightDrawerWidth: '300px',
  clickableElementBackgroundTransition: 'background 0.1s ease',
  lastLayerZIndex: 2147483647,
};

export const lightTheme = {
  ...common,
  ...{
    background: backgroundLight,
    border: borderLight,
    boxShadow: boxShadowLight,
    font: fontLight,
  },
};
export type ThemeType = typeof lightTheme;

export const darkTheme: ThemeType = {
  ...common,
  ...{
    background: backgroundDark,
    border: borderDark,
    boxShadow: boxShadowDark,
    font: fontDark,
  },
};

export const MOBILE_VIEWPORT = 768;
