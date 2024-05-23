import { MAIN_COLORS } from 'twenty-ui';

export const MAIN_COLOR_NAMES = Object.keys(MAIN_COLORS) as ThemeColor[];

export type ThemeColor = keyof typeof MAIN_COLORS;
