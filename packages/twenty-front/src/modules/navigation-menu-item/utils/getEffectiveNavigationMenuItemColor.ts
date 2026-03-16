import { isNonEmptyString } from '@sniptt/guards';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorFolder';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorLink';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';

export const getEffectiveNavigationMenuItemColor = (
  navigationMenuItem: {
    itemType: NavigationMenuItemType;
    color?: string | null;
  },
  objectColor?: string,
): string | undefined => {
  if (navigationMenuItem.itemType === NavigationMenuItemType.FOLDER) {
    return isNonEmptyString(navigationMenuItem.color)
      ? navigationMenuItem.color
      : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER;
  }
  if (navigationMenuItem.itemType === NavigationMenuItemType.OBJECT) {
    return objectColor;
  }
  if (navigationMenuItem.itemType === NavigationMenuItemType.VIEW) {
    return objectColor;
  }
  if (navigationMenuItem.itemType === NavigationMenuItemType.LINK) {
    return DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK;
  }
  return undefined;
};
