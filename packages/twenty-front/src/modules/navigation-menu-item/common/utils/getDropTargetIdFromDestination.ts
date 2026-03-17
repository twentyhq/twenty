import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/common/utils/validateAndExtractWorkspaceFolderId';
import type { DropResult } from '@hello-pangea/dnd';

export const getDropTargetIdFromDestination = (
  destination: DropResult['destination'],
): string | null => {
  if (
    !destination ||
    !canNavigationMenuItemBeDroppedIn({
      navigationMenuItemSection: 'workspace',
      droppableId: destination.droppableId,
    })
  ) {
    return null;
  }
  const folderId = validateAndExtractWorkspaceFolderId(destination.droppableId);
  const folderSegment = folderId ?? 'orphan';
  return `${NavigationSections.WORKSPACE}-${folderSegment}-${destination.index}`;
};
