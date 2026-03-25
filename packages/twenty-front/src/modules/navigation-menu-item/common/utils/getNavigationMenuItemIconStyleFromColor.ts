import { getColorFromTheme } from '@/navigation-menu-item/common/utils/getColorFromTheme';
import { COLOR_SHADE_BACKGROUND } from '@/navigation-menu-item/common/utils/navigationMenuItemIconColorShadeBackground';
import { COLOR_SHADE_BORDER } from '@/navigation-menu-item/common/utils/navigationMenuItemIconColorShadeBorder';
import { COLOR_SHADE_ICON } from '@/navigation-menu-item/common/utils/navigationMenuItemIconColorShadeIcon';
import { type NavigationMenuItemIconStyle } from '@/navigation-menu-item/common/utils/navigationMenuItemIconStyle';
import { parseThemeColor } from '@/navigation-menu-item/common/utils/parseThemeColor';

export const getNavigationMenuItemIconStyleFromColor = (
  color: string | null | undefined,
): NavigationMenuItemIconStyle => {
  const themeColor = parseThemeColor(color);
  return {
    backgroundColor: getColorFromTheme(themeColor, COLOR_SHADE_BACKGROUND),
    iconColor: getColorFromTheme(themeColor, COLOR_SHADE_ICON),
    borderColor: getColorFromTheme(themeColor, COLOR_SHADE_BORDER),
  };
};
