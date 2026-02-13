import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';

export const isLocationMatchingNavigationMenuItem = (
  currentPath: string,
  currentViewPath: string,
  navigationMenuItem: Pick<ProcessedNavigationMenuItem, 'itemType' | 'link'>,
) => {
  const isViewItem =
    navigationMenuItem.itemType === NavigationMenuItemType.VIEW;
  return isViewItem
    ? navigationMenuItem.link === currentViewPath
    : navigationMenuItem.link === currentPath;
};
