import { isNonEmptyString } from '@sniptt/guards';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorFolder';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorLink';
import { NavigationMenuItemType } from 'twenty-shared/types';

export const getEffectiveNavigationMenuItemColor = (
  navigationMenuItem: {
    type: NavigationMenuItemType;
    color?: string | null;
  },
  objectColor?: string,
): string | undefined => {
  if (navigationMenuItem.type === NavigationMenuItemType.FOLDER) {
    return isNonEmptyString(navigationMenuItem.color)
      ? navigationMenuItem.color
      : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER;
  }
  if (navigationMenuItem.type === NavigationMenuItemType.OBJECT) {
    return objectColor;
  }
  if (navigationMenuItem.type === NavigationMenuItemType.VIEW) {
    return objectColor;
  }
  if (navigationMenuItem.type === NavigationMenuItemType.LINK) {
    return DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK;
  }
  return undefined;
};
