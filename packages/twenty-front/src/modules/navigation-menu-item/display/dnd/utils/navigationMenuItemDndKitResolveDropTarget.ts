import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import type { DroppableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDroppableData';
import type { SortableTargetDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitSortableTargetDestination';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { getDestinationFromSortableTarget } from '@/navigation-menu-item/display/dnd/utils/navigationMenuItemDndKitGetDestinationFromSortableTarget';

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
  navigationMenuItemSection: NavigationMenuItemSection,
): SortableTargetDestination | null => {
  if (target === null || target === undefined) {
    return null;
  }
  if (isDefined(target.group) && isDefined(target.index)) {
    return getDestinationFromSortableTarget(
      { id: target.id, group: target.group, index: target.index },
      getNavItemById,
      navigationMenuItemSection,
    );
  }
  if (isDroppableData(target.data)) {
    const { droppableId, index, insertBeforeItemId } = target.data;
    if (
      canNavigationMenuItemBeDroppedIn({
        navigationMenuItemSection,
        droppableId,
      })
    ) {
      return {
        destination: { droppableId, index },
        effectiveDropTargetId: String(target.id),
        isTargetFolder: false,
        dropTargetId: String(target.id),
        insertBeforeItemId,
      };
    }
  }
  return null;
};
