import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { isDefined } from 'twenty-shared/utils';

import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
import { getPositionBetween } from '@/navigation-menu-item/common/utils/getPositionBetween';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuItemEditSectionItems } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditSectionItems';

export const useNavigationMenuItemMoveRemove = (
  section: NavigationMenuItemSection,
) => {
  const { currentItems, updateItem, deleteItems } =
    useNavigationMenuItemEditController(section);
  const items = useNavigationMenuItemEditSectionItems(section);
  const visibleItemIds = new Set(items.map((item) => item.id));

  const getSortedSiblings = (navigationMenuItemId: string) => {
    const currentItem = currentItems.find(
      (item) => item.id === navigationMenuItemId,
    );
    if (!isDefined(currentItem)) {
      return null;
    }
    const folderId = currentItem.folderId ?? null;
    const isTabOrSection = isNavigationMenuItemTabOrSection(currentItem);
    return currentItems
      .filter(
        (item) =>
          (item.folderId ?? null) === folderId &&
          (isTabOrSection
            ? item.type === currentItem.type
            : visibleItemIds.has(item.id)),
      )
      .sort((a, b) => a.position - b.position);
  };

  const moveUp = async (navigationMenuItemId: string) => {
    const siblings = getSortedSiblings(navigationMenuItemId);
    if (!isDefined(siblings)) {
      return;
    }
    const currentIndex = siblings.findIndex(
      (item) => item.id === navigationMenuItemId,
    );
    if (currentIndex <= 0) {
      return;
    }
    const prev = siblings[currentIndex - 1];
    const prevPrev = siblings[currentIndex - 2];
    await updateItem(navigationMenuItemId, {
      position: getPositionBetween(prevPrev?.position, prev.position),
    });
  };

  const moveDown = async (navigationMenuItemId: string) => {
    const siblings = getSortedSiblings(navigationMenuItemId);
    if (!isDefined(siblings)) {
      return;
    }
    const currentIndex = siblings.findIndex(
      (item) => item.id === navigationMenuItemId,
    );
    if (currentIndex < 0 || currentIndex >= siblings.length - 1) {
      return;
    }
    const next = siblings[currentIndex + 1];
    const nextNext = siblings[currentIndex + 2];
    await updateItem(navigationMenuItemId, {
      position: getPositionBetween(next.position, nextNext?.position),
    });
  };

  const remove = async (navigationMenuItemId: string) => {
    const itemToRemove = currentItems.find(
      (item) => item.id === navigationMenuItemId,
    );
    if (!isDefined(itemToRemove)) {
      return;
    }

    await deleteItems([
      navigationMenuItemId,
      ...getNavigationMenuItemDescendantIds(currentItems, navigationMenuItemId),
    ]);
  };

  const moveToFolder = async (
    navigationMenuItemId: string,
    targetFolderId: string | null,
  ) => {
    const itemToMove = currentItems.find(
      (item) => item.id === navigationMenuItemId,
    );
    if (!isDefined(itemToMove)) {
      return;
    }

    const isFolder = isNavigationMenuItemFolder(itemToMove);
    if (isFolder && targetFolderId === navigationMenuItemId) {
      return;
    }

    // Block moving a folder into one of its own descendants (would orphan the subtree).
    if (isFolder && isDefined(targetFolderId)) {
      const descendantFolderIds = new Set<string>();
      const collectDescendants = (folderId: string) => {
        currentItems
          .filter(
            (item) =>
              isNavigationMenuItemFolder(item) && item.folderId === folderId,
          )
          .forEach((item) => {
            descendantFolderIds.add(item.id);
            collectDescendants(item.id);
          });
      };
      collectDescendants(navigationMenuItemId);
      if (descendantFolderIds.has(targetFolderId)) {
        return;
      }
    }

    const itemsInTargetFolder = currentItems.filter(
      (item) =>
        (item.folderId ?? null) === targetFolderId &&
        isNavigationMenuItemTabOrSection(item) ===
          isNavigationMenuItemTabOrSection(itemToMove),
    );
    const maxPositionInTarget =
      itemsInTargetFolder.length > 0
        ? Math.max(...itemsInTargetFolder.map((item) => item.position))
        : -1;

    await updateItem(navigationMenuItemId, {
      folderId: targetFolderId ?? null,
      position: maxPositionInTarget + 1,
    });
  };

  return { items, getSortedSiblings, moveUp, moveDown, remove, moveToFolder };
};
