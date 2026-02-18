import type { Theme } from '@emotion/react';
import type { ThemeColor } from 'twenty-ui/theme';

import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';

const DEFAULT_NAV_ITEM_ICON_COLOR: ThemeColor = 'gray';

export type NavigationMenuItemIconStyle = {
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
};

const COLOR_SHADE_ICON = 10;
const COLOR_SHADE_BACKGROUND = 5;
const COLOR_SHADE_BORDER = 6;

const getColorFromTheme = (
  theme: Theme,
  themeColor: ThemeColor,
  shade: number,
): string => {
  const colorMap = theme.color as unknown as Record<string, string>;
  const key = `${themeColor}${shade}`;
  return colorMap[key] ?? theme.tag.text[themeColor];
};

export const getNavigationMenuItemIconBorderColor = (
  theme: Theme,
  themeColor: ThemeColor,
): string => getColorFromTheme(theme, themeColor, COLOR_SHADE_BORDER);

export const getNavigationMenuItemIconStyleFromColor = (
  theme: Theme,
  color: string | null | undefined,
): NavigationMenuItemIconStyle => {
  const themeColor = parseThemeColor(color ?? DEFAULT_NAV_ITEM_ICON_COLOR);
  return {
    backgroundColor: getColorFromTheme(
      theme,
      themeColor,
      COLOR_SHADE_BACKGROUND,
    ),
    iconColor: getColorFromTheme(theme, themeColor, COLOR_SHADE_ICON),
    borderColor: getColorFromTheme(theme, themeColor, COLOR_SHADE_BORDER),
  };
};
