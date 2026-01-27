import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';

export const isLocationMatchingNavigationMenuItem = (
  currentPath: string,
  currentViewPath: string,
  navigationMenuItem: Pick<
    ProcessedNavigationMenuItem,
    'objectNameSingular' | 'link'
  >,
) => {
  return navigationMenuItem.objectNameSingular === 'view'
    ? navigationMenuItem.link === currentViewPath
    : navigationMenuItem.link === currentPath;
};
