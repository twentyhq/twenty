import type { Theme } from '@emotion/react';
import type { ThemeColor } from 'twenty-ui/theme';

import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';

const DEFAULT_NAV_ITEM_ICON_COLOR: ThemeColor = 'gray';

export type NavigationMenuItemIconStyle = {
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
};

export const getNavigationMenuItemIconBorderColor = (
  theme: Theme,
  themeColor: ThemeColor,
): string => {
  const colorKey = `${themeColor}5`;
  const borderColor = (theme.color as unknown as Record<string, string>)[
    colorKey
  ];
  return borderColor ?? theme.tag.text[themeColor];
};

export const getNavigationMenuItemIconStyleFromColor = (
  theme: Theme,
  color: string | null | undefined,
): NavigationMenuItemIconStyle => {
  const themeColor = parseThemeColor(color ?? DEFAULT_NAV_ITEM_ICON_COLOR);
  return {
    backgroundColor: theme.tag.background[themeColor],
    iconColor: theme.tag.text[themeColor],
    borderColor: getNavigationMenuItemIconBorderColor(theme, themeColor),
  };
};
