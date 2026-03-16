import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';

export const isLocationMatchingNavigationMenuItem = (
  currentPath: string,
  currentViewPath: string,
  navigationMenuItem: Pick<ProcessedNavigationMenuItem, 'itemType' | 'link'>,
) => {
  const isViewBasedItem =
    navigationMenuItem.itemType === NavigationMenuItemType.VIEW ||
    navigationMenuItem.itemType === NavigationMenuItemType.OBJECT;
  return isViewBasedItem
    ? navigationMenuItem.link === currentViewPath
    : navigationMenuItem.link === currentPath;
};
