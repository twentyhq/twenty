import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import type { DropResult } from '@hello-pangea/dnd';

export const getFavoritesDropTargetIdFromDestination = (
  destination: DropResult['destination'],
): string | null => {
  if (!destination) return null;
  const { droppableId, index } = destination;
  if (
    droppableId ===
    NavigationMenuItemDroppableIds.FAVORITE_ORPHAN_NAVIGATION_MENU_ITEMS
  ) {
    return `${NavigationSections.FAVORITES}-orphan-${index}`;
  }
  if (
    droppableId.startsWith(
      NavigationMenuItemDroppableIds.FAVORITE_FOLDER_PREFIX,
    )
  ) {
    const folderId = droppableId.slice(
      NavigationMenuItemDroppableIds.FAVORITE_FOLDER_PREFIX.length,
    );
    return `${NavigationSections.FAVORITES}-${folderId}-${index}`;
  }
  return null;
};
