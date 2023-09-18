/* eslint-disable twenty-ts/no-hardcoded-colors */
import { accentDark, accentLight } from './accent';
import { animation } from './animation';
import { backgroundDark, backgroundLight } from './background';
import { blur } from './blur';
import { borderDark, borderLight } from './border';
import { boxShadowDark, boxShadowLight } from './boxShadow';
import { color, grayScale } from './colors';
import { fontDark, fontLight } from './font';
import { icon } from './icon';
import { modal } from './modal';
import { tagDark, tagLight } from './tag';
import { text } from './text';

const common = {
  color: color,
  grayScale: grayScale,
  icon: icon,
  modal: modal,
  text: text,
  blur: blur,
  animation: animation,
  snackBar: {
    success: {
      background: '#16A26B',
      color: '#D0F8E9',
    },
    error: {
      background: '#B43232',
      color: '#FED8D8',
    },
    info: {
      background: color.gray80,
      color: grayScale.gray0,
    },
  },
  spacingMultiplicator: 4,
  spacing: (multiplicator: number) => `${multiplicator * 4}px`,
  betweenSiblingsGap: `2px`,
  table: {
    horizontalCellMargin: '8px',
    checkboxColumnWidth: '32px',
  },
  rightDrawerWidth: '500px',
  clickableElementBackgroundTransition: 'background 0.1s ease',
  lastLayerZIndex: 2147483647,
};

export const lightTheme = {
  ...common,
  ...{
    accent: accentLight,
    background: backgroundLight,
    border: borderLight,
    tag: tagLight,
    boxShadow: boxShadowLight,
    font: fontLight,
    name: 'light',
  },
};
export type ThemeType = typeof lightTheme;

export const darkTheme: ThemeType = {
  ...common,
  ...{
    accent: accentDark,
    background: backgroundDark,
    border: borderDark,
    tag: tagDark,
    boxShadow: boxShadowDark,
    font: fontDark,
    name: 'dark',
  },
};

export const MOBILE_VIEWPORT = 768;
