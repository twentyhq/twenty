import { CustomError } from '@/error-handler/CustomError';
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
    if (!folderId)
      throw new CustomError(
        `Invalid folder header ID: ${droppableId}`,
        'INVALID_FOLDER_HEADER_ID',
      );
    return folderId;
  }

  if (droppableId.startsWith(FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX)) {
    const folderId = droppableId.replace(
      FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX,
      '',
    );
    if (!folderId)
      throw new CustomError(
        `Invalid folder ID: ${droppableId}`,
        'INVALID_FOLDER_ID',
      );
    return folderId;
  }

  throw new CustomError(
    `Invalid droppable ID format: ${droppableId}`,
    'INVALID_DROPPABLE_ID_FORMAT',
  );
};
