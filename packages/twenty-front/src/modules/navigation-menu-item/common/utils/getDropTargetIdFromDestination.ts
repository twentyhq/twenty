import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/common/utils/isWorkspaceDroppableId';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/common/utils/validateAndExtractWorkspaceFolderId';
import type { DropResult } from '@hello-pangea/dnd';

export const getDropTargetIdFromDestination = (
  destination: DropResult['destination'],
): string | null => {
  if (!destination || !isWorkspaceDroppableId(destination.droppableId)) {
    return null;
  }
  const folderId = validateAndExtractWorkspaceFolderId(destination.droppableId);
  const folderSegment = folderId ?? 'orphan';
  return `${NavigationSections.WORKSPACE}-${folderSegment}-${destination.index}`;
};
