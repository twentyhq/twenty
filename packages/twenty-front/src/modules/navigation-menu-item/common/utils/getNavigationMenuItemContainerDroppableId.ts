import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';

export const getNavigationMenuItemContainerDroppableId = (
  containerId: string | null,
): string =>
  isDefined(containerId)
    ? `${NavigationMenuItemDroppableIds.WORKSPACE_CONTAINER_PREFIX}${containerId}`
    : NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS;
