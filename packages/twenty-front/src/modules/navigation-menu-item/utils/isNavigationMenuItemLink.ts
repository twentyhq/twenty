import { NavigationMenuItemType } from 'twenty-shared/types';

export const isNavigationMenuItemLink = (item: { type?: string | null }) =>
  item.type === NavigationMenuItemType.LINK;
