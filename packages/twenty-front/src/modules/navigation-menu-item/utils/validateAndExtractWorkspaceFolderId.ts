import { CustomError, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_ITEM_DROPPABLE_IDS } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';

export const matchesWorkspaceFolderId = (
  item: NavigationMenuItem,
  folderId: string | null,
): boolean =>
  (folderId === null && !isDefined(item.folderId)) ||
  (isDefined(folderId) && item.folderId === folderId);

export const validateAndExtractWorkspaceFolderId = (
  droppableId: string,
): string | null => {
  if (
    droppableId ===
    NAVIGATION_MENU_ITEM_DROPPABLE_IDS.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
  ) {
    return null;
  }

  if (
    droppableId.startsWith(
      NAVIGATION_MENU_ITEM_DROPPABLE_IDS.WORKSPACE_FOLDER_HEADER_PREFIX,
    )
  ) {
    const folderId = droppableId.replace(
      NAVIGATION_MENU_ITEM_DROPPABLE_IDS.WORKSPACE_FOLDER_HEADER_PREFIX,
      '',
    );
    if (!folderId)
      throw new CustomError(
        `Invalid workspace folder header ID: ${droppableId}`,
        'INVALID_WORKSPACE_FOLDER_HEADER_ID',
      );
    return folderId;
  }

  if (
    droppableId.startsWith(
      NAVIGATION_MENU_ITEM_DROPPABLE_IDS.WORKSPACE_FOLDER_PREFIX,
    )
  ) {
    const folderId = droppableId.replace(
      NAVIGATION_MENU_ITEM_DROPPABLE_IDS.WORKSPACE_FOLDER_PREFIX,
      '',
    );
    if (!folderId)
      throw new CustomError(
        `Invalid workspace folder ID: ${droppableId}`,
        'INVALID_WORKSPACE_FOLDER_ID',
      );
    return folderId;
  }

  throw new CustomError(
    `Invalid workspace droppable ID format: ${droppableId}`,
    'INVALID_WORKSPACE_DROPPABLE_ID_FORMAT',
  );
};
