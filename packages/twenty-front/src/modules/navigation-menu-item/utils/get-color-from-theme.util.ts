import type { Theme } from '@emotion/react';
import type { ThemeColor } from 'twenty-ui/theme';

export const getColorFromTheme = (
  theme: Theme,
  themeColor: ThemeColor,
  shade: number,
): string => {
  const colorMap = theme.color as unknown as Record<string, string>;
  const key = `${themeColor}${shade}`;
  return colorMap[key] ?? theme.tag.text[themeColor];
};
