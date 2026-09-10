import { type ThemeColor } from 'twenty-ui/theme';

// twenty-ui's MAIN_COLORS_LIGHT holds display-p3 strings, which the hex
// validator in get-bot-image-background rejects — it would silently fall back
// to the default background. Named colours are stored as the sRGB equivalent
// of the same Radix step instead.
export const THEME_COLOR_HEX: Record<ThemeColor, string> = {
  red: '#e5484d',
  ruby: '#e54666',
  crimson: '#e93d82',
  tomato: '#e54d2e',
  orange: '#f76b15',
  amber: '#ffc53d',
  yellow: '#ffe629',
  lime: '#bdee63',
  grass: '#46a758',
  green: '#30a46c',
  jade: '#29a383',
  mint: '#86ead4',
  turquoise: '#12a594',
  cyan: '#00a2c7',
  sky: '#7ce2fe',
  blue: '#3e63dd',
  iris: '#5b5bd6',
  violet: '#6e56cf',
  purple: '#8e4ec6',
  plum: '#ab4aba',
  pink: '#d6409f',
  bronze: '#a18072',
  gold: '#978365',
  brown: '#ad7f58',
  gray: '#999999',
};
