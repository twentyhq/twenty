import { NavigationMenuItemType } from 'twenty-shared/types';

export const isNavigationMenuItemObject = (item: { type?: string | null }) =>
  item.type === NavigationMenuItemType.OBJECT;
