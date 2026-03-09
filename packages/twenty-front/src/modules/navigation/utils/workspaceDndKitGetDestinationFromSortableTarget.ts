import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { getDndKitDropTargetId } from '@/navigation-menu-item/utils/getDndKitDropTargetId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

import type { DropDestination } from '@/navigation/types/workspaceDndKitDropDestination';
import type { SortableTargetDestination } from '@/navigation/types/workspaceDndKitSortableTargetDestination';

type GetNavItemById = (
  id: string | undefined,
) => NavigationMenuItem | undefined;

export const getDestinationFromSortableTarget = (
  target: { id: unknown; group?: unknown; index?: unknown },
  getNavItemById: GetNavItemById,
): SortableTargetDestination | null => {
  const group = target.group;
  const rawIndex = target.index;
  if (!isDefined(group) || !isDefined(rawIndex)) {
    return null;
  }
  const index = Number(rawIndex);
  if (!Number.isInteger(index) || index < 0) {
    return null;
  }
  const destDroppableId = String(group);
  const targetItem = getNavItemById(
    target.id != null ? String(target.id) : undefined,
  );
  const isTargetFolder =
    isDefined(targetItem) && isNavigationMenuItemFolder(targetItem);
  const dropTargetId = getDndKitDropTargetId(destDroppableId, index);
  const effectiveDropTargetId = isTargetFolder
    ? getDndKitDropTargetId(
        `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX}${target.id}`,
        0,
      )
    : dropTargetId;
  const destination: DropDestination = {
    droppableId: isTargetFolder
      ? `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX}${target.id}`
      : destDroppableId,
    index: isTargetFolder ? 0 : index,
  };
  return {
    destination,
    effectiveDropTargetId,
    isTargetFolder,
    dropTargetId,
  };
};
