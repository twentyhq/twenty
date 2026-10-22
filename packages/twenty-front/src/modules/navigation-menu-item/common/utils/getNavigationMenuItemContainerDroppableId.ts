import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';

export const getNavigationMenuItemContainerDroppableId = (
  containerId: string | null,
): string =>
  containerId === null
    ? NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
    : `${NavigationMenuItemDroppableIds.WORKSPACE_CONTAINER_PREFIX}${containerId}`;
