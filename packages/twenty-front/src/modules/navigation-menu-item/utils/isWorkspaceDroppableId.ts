import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';

export const isWorkspaceDroppableId = (
  droppableId: string | null | undefined,
): boolean => {
  if (!isDefined(droppableId)) {
    return false;
  }
  return (
    droppableId ===
      NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS ||
    droppableId.startsWith(
      NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX,
    ) ||
    droppableId.startsWith(
      NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX,
    )
  );
};
