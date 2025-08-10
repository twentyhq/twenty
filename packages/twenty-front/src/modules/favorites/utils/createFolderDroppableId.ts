import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';
import { type FavoriteDroppableId } from '@/favorites/types/FavoriteDroppableId';

export const createFolderDroppableId = (
  folderId: string,
): FavoriteDroppableId => `${FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX}${folderId}`;
