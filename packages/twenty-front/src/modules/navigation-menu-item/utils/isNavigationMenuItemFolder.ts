import { NavigationMenuItemType } from 'twenty-shared/types';

export const isNavigationMenuItemFolder = (item: { type?: string | null }) =>
  item.type === NavigationMenuItemType.FOLDER;
