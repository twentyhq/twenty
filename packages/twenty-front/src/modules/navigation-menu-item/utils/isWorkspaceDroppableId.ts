import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_ITEM_DROPPABLE_IDS } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';

export const isWorkspaceDroppableId = (
  droppableId: string | null | undefined,
): boolean => {
  if (!isDefined(droppableId)) {
    return false;
  }
  return (
    droppableId ===
      NAVIGATION_MENU_ITEM_DROPPABLE_IDS.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS ||
    droppableId.startsWith(
      NAVIGATION_MENU_ITEM_DROPPABLE_IDS.WORKSPACE_FOLDER_PREFIX,
    ) ||
    droppableId.startsWith(
      NAVIGATION_MENU_ITEM_DROPPABLE_IDS.WORKSPACE_FOLDER_HEADER_PREFIX,
    )
  );
};
