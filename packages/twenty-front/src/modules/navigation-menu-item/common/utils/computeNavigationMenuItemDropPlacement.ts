import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import type { NavigationMenuItemDropPlacement } from '@/navigation-menu-item/common/types/NavigationMenuItemDropPlacement';
import type { NavigationMenuItemDroppableTarget } from '@/navigation-menu-item/common/types/NavigationMenuItemDroppableTarget';
import { computeDndReorderPosition } from '@/navigation-menu-item/common/utils/computeDndReorderPosition';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

type SortedNavigationMenuItem = Pick<
  NavigationMenuItem,
  'id' | 'position' | 'parentId' | 'type'
>;

const matchesParentId = (
  item: Pick<NavigationMenuItem, 'parentId'>,
  parentId: string | null,
): boolean => (item.parentId ?? null) === parentId;

export const computeNavigationMenuItemDropPlacement = ({
  draggedItem,
  sourceParentId,
  destinationTarget,
  destinationIndex,
  insertBeforeItemId,
  sortedItems,
}: {
  draggedItem: Pick<NavigationMenuItem, 'id' | 'type'>;
  sourceParentId: string | null;
  destinationTarget: NavigationMenuItemDroppableTarget;
  destinationIndex: number;
  insertBeforeItemId?: string | null;
  sortedItems: SortedNavigationMenuItem[];
}): NavigationMenuItemDropPlacement | null => {
  const destinationParentId = destinationTarget.parentId;
  const isDestinationFolder =
    destinationTarget.kind === 'folder' ||
    destinationTarget.kind === 'folderHeader';

  if (isNavigationMenuItemFolder(draggedItem) && isDestinationFolder) {
    return null;
  }

  if (destinationTarget.kind === 'folderHeader') {
    if (!isDefined(destinationParentId)) {
      throw new Error(doNotTranslate('Invalid folder header ID'));
    }

    const folderItems = sortedItems.filter((item) =>
      matchesParentId(item, destinationParentId),
    );

    return {
      position: computeDndReorderPosition({
        sortedList: folderItems,
        draggableId: draggedItem.id,
        destinationIndex: folderItems.length,
      }),
      parentId: destinationParentId,
      folderIdToOpen: destinationParentId,
    };
  }

  const isSameParent = sourceParentId === destinationParentId;
  const destinationItems = sortedItems.filter(
    (item) =>
      matchesParentId(item, destinationParentId) &&
      !isNavigationMenuItemTabOrSection(item),
  );

  if (
    isSameParent &&
    !destinationItems.some((item) => item.id === draggedItem.id)
  ) {
    return null;
  }

  const insertBeforeIndex = isDefined(insertBeforeItemId)
    ? destinationItems.findIndex((item) => item.id === insertBeforeItemId)
    : -1;

  return {
    position: computeDndReorderPosition({
      sortedList: destinationItems,
      draggableId: draggedItem.id,
      destinationIndex:
        insertBeforeIndex >= 0
          ? insertBeforeIndex
          : Math.min(destinationIndex, destinationItems.length),
    }),
    parentId: isSameParent ? undefined : destinationParentId,
  };
};
