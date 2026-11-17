import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuTabsInDisplayOrder = (
  navigationMenuItems: NavigationMenuItem[],
): NavigationMenuItem[] =>
  navigationMenuItems
    .filter(isNavigationMenuItemTab)
    .sort((a, b) => a.position - b.position);
