import { mainColors, ThemeColor } from '../constants/colors';

export const COLORS = Object.keys(mainColors);

export const isThemeColor = (color: string): color is ThemeColor =>
  COLORS.includes(color);
