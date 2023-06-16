import { backgroundColorsDark, backgroundColorsLight } from './background';
import { borderColorsDark, borderColorsLight } from './border';
import { modalColorsDark, modalColorsLight } from './modal';
import { textColorsDark, textColorsLight } from './text';
import { transparentColorsDark, transparentColorsLight } from './transparent';

export const commonColors = {
  ...backgroundColorsDark,
};

export const lightThemeColors = {
  ...backgroundColorsLight,
  ...borderColorsLight,
  ...modalColorsLight,
  ...textColorsLight,
  ...transparentColorsLight,
};

export const darkThemeColors = {
  ...backgroundColorsDark,
  ...borderColorsDark,
  ...modalColorsDark,
  ...textColorsDark,
  ...transparentColorsDark,
};
