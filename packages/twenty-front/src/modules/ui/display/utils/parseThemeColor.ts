import { DEFAULT_THEME_COLOR_FALLBACK, type ThemeColor } from 'twenty-ui/theme';
import { themeColorSchema } from 'twenty-ui/utilities';

export const parseThemeColor = (
  color: string | null | undefined,
): ThemeColor => {
  const result = themeColorSchema.safeParse(color ?? '');
  return result.success ? result.data : DEFAULT_THEME_COLOR_FALLBACK;
};
