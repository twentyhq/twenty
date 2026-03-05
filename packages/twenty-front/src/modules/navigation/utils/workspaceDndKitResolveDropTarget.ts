import type { NavigationMenuItem } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

import { parseDropTargetIdToDestination } from '@/navigation-menu-item/utils/parseDropTargetIdToDestination';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';

import { getDestinationFromSortableTarget } from '@/navigation/utils/workspaceDndKitGetDestinationFromSortableTarget';
import type { ResolvedDropTarget } from '@/navigation/utils/workspaceDndKitResolvedDropTarget';

type GetNavItemById = (
  id: string | undefined,
) => NavigationMenuItem | undefined;

/**
 * Resolves destination and drop target id from dnd-kit operation target.
 * Used by both handleDragOver (visuals) and handleDragEnd (apply drop).
 */
export const resolveDropTarget = (
  target: { id?: unknown; group?: unknown; index?: unknown } | null,
  getNavItemById: GetNavItemById,
): ResolvedDropTarget | null => {
  if (target === null || target === undefined) return null;
  if (isDefined(target.group) && isDefined(target.index)) {
    return getDestinationFromSortableTarget(
      { id: target.id, group: target.group, index: target.index },
      getNavItemById,
    );
  }
  if (typeof target.id === 'string') {
    const parsed = parseDropTargetIdToDestination(target.id);
    if (isDefined(parsed) && isWorkspaceDroppableId(parsed.droppableId)) {
      return {
        destination: parsed,
        effectiveDropTargetId: target.id,
        isTargetFolder: false,
        dropTargetId: target.id,
      };
    }
  }
  return null;
};
