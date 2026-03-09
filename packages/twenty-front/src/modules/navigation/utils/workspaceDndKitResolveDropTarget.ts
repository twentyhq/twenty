import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';

import type { DroppableData } from '@/navigation/types/workspaceDndKitDroppableData';
import type { SortableTargetDestination } from '@/navigation/types/workspaceDndKitSortableTargetDestination';
import { getDestinationFromSortableTarget } from '@/navigation/utils/workspaceDndKitGetDestinationFromSortableTarget';

type GetNavItemById = (
  id: string | undefined,
) => NavigationMenuItem | undefined;

const isDroppableData = (data: unknown): data is DroppableData =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as DroppableData).droppableId === 'string' &&
  typeof (data as DroppableData).index === 'number';

export const resolveDropTarget = (
  target: {
    id?: unknown;
    group?: unknown;
    index?: unknown;
    data?: unknown;
  } | null,
  getNavItemById: GetNavItemById,
): SortableTargetDestination | null => {
  if (target === null || target === undefined) {
    return null;
  }
  if (isDefined(target.group) && isDefined(target.index)) {
    return getDestinationFromSortableTarget(
      { id: target.id, group: target.group, index: target.index },
      getNavItemById,
    );
  }
  if (isDroppableData(target.data)) {
    const { droppableId, index } = target.data;
    if (isWorkspaceDroppableId(droppableId)) {
      return {
        destination: { droppableId, index },
        effectiveDropTargetId: String(target.id),
        isTargetFolder: false,
        dropTargetId: String(target.id),
      };
    }
  }
  return null;
};
