import { isNonEmptyString } from '@sniptt/guards';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';

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
    NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
  ) {
    return null;
  }

  if (
    droppableId.startsWith(
      NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX,
    )
  ) {
    const folderId = droppableId.replace(
      NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX,
      '',
    );
    if (!isNonEmptyString(folderId))
      throw new CustomError(
        `Invalid workspace folder header ID: ${droppableId}`,
        'INVALID_WORKSPACE_FOLDER_HEADER_ID',
      );
    return folderId;
  }

  if (
    droppableId.startsWith(
      NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX,
    )
  ) {
    const folderId = droppableId.replace(
      NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX,
      '',
    );
    if (!isNonEmptyString(folderId))
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
