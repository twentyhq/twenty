import { themeColorSchema, type ThemeColor } from 'twenty-ui/theme';

export const parseThemeColor = (
  color: string | null | undefined,
): ThemeColor => {
  const result = themeColorSchema.safeParse(color ?? '');
  return result.success ? result.data : 'gray';
};
