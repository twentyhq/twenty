import type { Theme } from '@emotion/react';

import { DEFAULT_NAV_ITEM_ICON_COLOR } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultIconColor.constant';
import { getColorFromTheme } from '@/navigation-menu-item/utils/get-color-from-theme.util';
import { COLOR_SHADE_BACKGROUND } from '@/navigation-menu-item/utils/NavigationMenuItemIconColorShadeBackground.constant';
import { COLOR_SHADE_BORDER } from '@/navigation-menu-item/utils/NavigationMenuItemIconColorShadeBorder.constant';
import { COLOR_SHADE_ICON } from '@/navigation-menu-item/utils/NavigationMenuItemIconColorShadeIcon.constant';
import { type NavigationMenuItemIconStyle } from '@/navigation-menu-item/utils/navigation-menu-item-icon-style.type';
import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';

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
