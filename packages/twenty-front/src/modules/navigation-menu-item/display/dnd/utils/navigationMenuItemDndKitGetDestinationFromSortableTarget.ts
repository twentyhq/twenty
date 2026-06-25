import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import type { DropDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDropDestination';
import type { SortableTargetDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitSortableTargetDestination';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';

type GetNavItemById = (
  id: string | undefined,
) => NavigationMenuItem | undefined;

export const getDestinationFromSortableTarget = (
  target: { id: unknown; group?: unknown; index?: unknown },
  getNavItemById: GetNavItemById,
  navigationMenuItemSection: NavigationMenuItemSection,
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

  const { folderHeaderPrefix, orphanDroppableId } =
    NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[navigationMenuItemSection];

  const isTopLevelOrphanGroup = destDroppableId === orphanDroppableId;

  const effectiveDropTargetId = isTargetFolder
    ? getDndKitDropTargetId(`${folderHeaderPrefix}${target.id}`, 0)
    : dropTargetId;

  const destination: DropDestination =
    isTargetFolder && isTopLevelOrphanGroup
      ? { droppableId: destDroppableId, index }
      : isTargetFolder
        ? {
            droppableId: `${folderHeaderPrefix}${String(target.id)}`,
            index: 0,
          }
        : { droppableId: destDroppableId, index };
  return {
    destination,
    effectiveDropTargetId,
    isTargetFolder,
    dropTargetId,
  };
};
