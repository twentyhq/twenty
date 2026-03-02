import { isNonEmptyString } from '@sniptt/guards';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorFolder';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorLink';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/types/processed-navigation-menu-item';

export const getEffectiveNavigationMenuItemColor = (
  navigationMenuItem: ProcessedNavigationMenuItem,
): string | undefined => {
  if (isNonEmptyString(navigationMenuItem.color)) {
    return navigationMenuItem.color;
  }
  if (navigationMenuItem.itemType === NavigationMenuItemType.FOLDER) {
    return DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER;
  }
  if (navigationMenuItem.itemType === NavigationMenuItemType.LINK) {
    return DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK;
  }
  return undefined;
};
