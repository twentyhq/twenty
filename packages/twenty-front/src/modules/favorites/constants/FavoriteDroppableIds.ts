import { FOLDER_DROPPABLE_IDS } from '@/ui/layout/draggable-list/utils/folderDroppableIds';

export const FAVORITE_DROPPABLE_IDS = {
  ORPHAN_FAVORITES: 'orphan-favorites',
  FOLDER_PREFIX: FOLDER_DROPPABLE_IDS.FOLDER_PREFIX,
  FOLDER_HEADER_PREFIX: FOLDER_DROPPABLE_IDS.FOLDER_HEADER_PREFIX,
} as const;
