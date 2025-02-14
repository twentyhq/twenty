import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';

export const validateAndExtractFolderId = (
  droppableId: string,
): string | null => {
  if (droppableId === FAVORITE_DROPPABLE_IDS.ORPHAN_FAVORITES) {
    return null;
  }

  if (droppableId.startsWith(FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX)) {
    const folderId = droppableId.replace(
      FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX,
      '',
    );
    if (!folderId) throw new Error(`Invalid folder header ID: ${droppableId}`);
    return folderId;
  }

  if (droppableId.startsWith(FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX)) {
    const folderId = droppableId.replace(
      FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX,
      '',
    );
    if (!folderId) throw new Error(`Invalid folder ID: ${droppableId}`);
    return folderId;
  }

  throw new Error(`Invalid droppable ID format: ${droppableId}`);
};
