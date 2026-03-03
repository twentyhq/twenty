import type { ThemeColor, ThemeType } from 'twenty-ui/theme';

import { getColorFromTheme } from '@/navigation-menu-item/utils/get-color-from-theme.util';
import { COLOR_SHADE_BORDER } from '@/navigation-menu-item/utils/NavigationMenuItemIconColorShadeBorder.constant';

export const getNavigationMenuItemIconBorderColor = (
  theme: ThemeType,
  themeColor: ThemeColor,
): string => getColorFromTheme(theme, themeColor, COLOR_SHADE_BORDER);
