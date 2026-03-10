import { DEFAULT_NAV_ITEM_ICON_COLOR } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultIconColor.constant';
import { getColorFromTheme } from '@/navigation-menu-item/utils/getColorFromTheme';
import { COLOR_SHADE_BACKGROUND } from '@/navigation-menu-item/utils/navigationMenuItemIconColorShadeBackground';
import { COLOR_SHADE_BORDER } from '@/navigation-menu-item/utils/navigationMenuItemIconColorShadeBorder';
import { COLOR_SHADE_ICON } from '@/navigation-menu-item/utils/navigationMenuItemIconColorShadeIcon';
import { type NavigationMenuItemIconStyle } from '@/navigation-menu-item/utils/navigationMenuItemIconStyle';
import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';

export const getNavigationMenuItemIconStyleFromColor = (
  color: string | null | undefined,
): NavigationMenuItemIconStyle => {
  const themeColor = parseThemeColor(color ?? DEFAULT_NAV_ITEM_ICON_COLOR);
  return {
    backgroundColor: getColorFromTheme(themeColor, COLOR_SHADE_BACKGROUND),
    iconColor: getColorFromTheme(themeColor, COLOR_SHADE_ICON),
    borderColor: getColorFromTheme(themeColor, COLOR_SHADE_BORDER),
  };
};
