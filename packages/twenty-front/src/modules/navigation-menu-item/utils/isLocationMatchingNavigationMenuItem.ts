import { NAVIGATION_MENU_ITEM_TYPE } from '@/navigation-menu-item/types/navigation-menu-item-type';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';

export const isLocationMatchingNavigationMenuItem = (
  currentPath: string,
  currentViewPath: string,
  navigationMenuItem: Pick<ProcessedNavigationMenuItem, 'itemType' | 'link'>,
) => {
  const isViewItem =
    navigationMenuItem.itemType === NAVIGATION_MENU_ITEM_TYPE.VIEW;
  return isViewItem
    ? navigationMenuItem.link === currentViewPath
    : navigationMenuItem.link === currentPath;
};
