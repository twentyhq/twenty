import { NavigationMenuItemType } from 'twenty-shared/types';

export const isLocationMatchingNavigationMenuItem = (
  currentPath: string,
  currentViewPath: string,
  navigationMenuItemType: NavigationMenuItemType,
  computedLink: string,
) => {
  const isViewBasedItem =
    navigationMenuItemType === NavigationMenuItemType.VIEW ||
    navigationMenuItemType === NavigationMenuItemType.OBJECT;
  return isViewBasedItem
    ? computedLink === currentViewPath
    : computedLink === currentPath;
};
