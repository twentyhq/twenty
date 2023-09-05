import { mainColors, ThemeColor } from '../constants/colors';

export const COLORS = Object.keys(mainColors);

export function isThemeColor(color: string): color is ThemeColor {
  return COLORS.includes(color);
}
