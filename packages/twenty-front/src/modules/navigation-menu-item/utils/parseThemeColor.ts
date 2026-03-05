import { type ThemeColor } from 'twenty-ui/theme';
import { themeColorSchema } from 'twenty-ui/utilities';

import { DEFAULT_NAV_ITEM_ICON_COLOR } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultIconColor.constant';

export const parseThemeColor = (
  color: string | null | undefined,
): ThemeColor => {
  const result = themeColorSchema.safeParse(color ?? '');
  return result.success ? result.data : DEFAULT_NAV_ITEM_ICON_COLOR;
};
