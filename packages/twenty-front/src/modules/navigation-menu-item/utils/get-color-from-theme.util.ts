import type { ThemeColor, ThemeType } from 'twenty-ui/theme';

export const getColorFromTheme = (
  theme: ThemeType,
  themeColor: ThemeColor,
  shade: number,
): string => {
  const colorMap = theme.color as unknown as Record<string, string>;
  const key = `${themeColor}${shade}`;
  return colorMap[key] ?? theme.tag.text[themeColor];
};
