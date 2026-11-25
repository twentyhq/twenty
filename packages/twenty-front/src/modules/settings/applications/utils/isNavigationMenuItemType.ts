import { NavigationMenuItemType } from 'twenty-shared/types';

const NAVIGATION_MENU_ITEM_TYPES = new Set<string>(
  Object.values(NavigationMenuItemType),
);

export const isNavigationMenuItemType = (
  value: string,
): value is NavigationMenuItemType => NAVIGATION_MENU_ITEM_TYPES.has(value);
