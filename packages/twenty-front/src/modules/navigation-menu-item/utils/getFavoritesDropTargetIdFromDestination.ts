import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import type { DropResult } from '@hello-pangea/dnd';

const FOLDER_PREFIX = 'folder-';

export const getFavoritesDropTargetIdFromDestination = (
  destination: DropResult['destination'],
): string | null => {
  if (!destination) return null;
  const { droppableId, index } = destination;
  if (
    droppableId === NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS
  ) {
    return `${NavigationSections.FAVORITES}-orphan-${index}`;
  }
  if (droppableId.startsWith(FOLDER_PREFIX)) {
    const folderId = droppableId.slice(FOLDER_PREFIX.length);
    return `${NavigationSections.FAVORITES}-${folderId}-${index}`;
  }
  return null;
};
