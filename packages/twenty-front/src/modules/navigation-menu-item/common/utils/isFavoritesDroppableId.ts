import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';

export const isFavoritesDroppableId = (
  droppableId: string | null | undefined,
): boolean => {
  if (!isDefined(droppableId)) {
    return false;
  }
  return (
    droppableId ===
      NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS ||
    droppableId.startsWith('folder-')
  );
};
