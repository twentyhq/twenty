import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';

export type FavoriteDroppableId =
  | typeof FAVORITE_DROPPABLE_IDS.ORPHAN_FAVORITES
  | `${typeof FAVORITE_DROPPABLE_IDS.FOLDER_PREFIX}${string}`
  | `${typeof FAVORITE_DROPPABLE_IDS.FOLDER_HEADER_PREFIX}${string}`;
