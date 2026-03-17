import type { ThemeColor } from 'twenty-ui/theme';

import { getColorFromTheme } from '@/navigation-menu-item/common/utils/getColorFromTheme';
import { COLOR_SHADE_BORDER } from '@/navigation-menu-item/common/utils/navigationMenuItemIconColorShadeBorder';

export const getNavigationMenuItemIconBorderColor = (
  themeColor: ThemeColor,
): string => getColorFromTheme(themeColor, COLOR_SHADE_BORDER);
