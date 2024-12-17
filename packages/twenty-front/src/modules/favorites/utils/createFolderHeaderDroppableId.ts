import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';
import { FavoriteDroppableId } from '@/favorites/types/FavoriteDroppableId';

export const createFolderHeaderDroppableId = (
  folderId: string,
): FavoriteDroppableId =>
  `${FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX}${folderId}`;
