import { commonColors, darkThemeColors, lightThemeColors } from './colors';
import { commonText } from './texts';
export { hoverBackground, overlayBackground, textInputStyle } from './effects';

const commonTheme = {
  ...commonText,
  ...commonColors,

  spacing: (multiplicator: number) => `${multiplicator * 4}px`,

  table: {
    horizontalCellMargin: '8px',
    checkboxColumnWidth: '32px',
  },
  clickableElementBackgroundTransition: 'background 0.1s ease',
  borderRadius: '4px',
  rightDrawerWidth: '300px',
  lastLayerZIndex: 2147483647,
};

const lightThemeSpecific = {
  ...lightThemeColors,

  blue: '#1961ed',
  pink: '#cc0078',
  green: '#1e7e50',
  purple: '#1111b7',
  yellow: '#cc660a',
  red: '#ff2e3f',

  blueHighTransparency: 'rgba(25, 97, 237, 0.03)',
  blueLowTransparency: 'rgba(25, 97, 237, 0.32)',
  boxShadow: '0px 2px 4px 0px #0F0F0F0A',
  modalBoxShadow: '0px 3px 12px rgba(0, 0, 0, 0.09)',
};

const darkThemeSpecific: typeof lightThemeSpecific = {
  ...darkThemeColors,

  blue: '#6895ec',
  pink: '#ffe5f4',
  green: '#e6fff2',
  purple: '#e0e0ff',
  yellow: '#fff2e7',
  red: '#ff2e3f',

  blueHighTransparency: 'rgba(104, 149, 236, 0.03)',
  blueLowTransparency: 'rgba(104, 149, 236, 0.32)',
  boxShadow: '0px 2px 4px 0px #0F0F0F0A', // TODO change color for dark theme
  modalBoxShadow: '0px 3px 12px rgba(0, 0, 0, 0.09)', // TODO change color for dark theme
};

export const lightTheme = { ...commonTheme, ...lightThemeSpecific };
export const darkTheme = { ...commonTheme, ...darkThemeSpecific };

export const MOBILE_VIEWPORT = 768;

export type ThemeType = typeof lightTheme;
