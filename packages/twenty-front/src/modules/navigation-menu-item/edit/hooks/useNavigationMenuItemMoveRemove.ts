import { isDefined } from 'twenty-shared/utils';

import { getPositionBetween } from '@/navigation-menu-item/common/utils/getPositionBetween';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuItemEditSectionItems } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditSectionItems';

export const useNavigationMenuItemMoveRemove = () => {
  const { currentItems, updateItem, deleteItems } =
    useNavigationMenuItemEditController();
  const items = useNavigationMenuItemEditSectionItems();
  const visibleItemIds = new Set(items.map((item) => item.id));

  const getSortedSiblings = (navigationMenuItemId: string) => {
    const currentItem = currentItems.find(
      (item) => item.id === navigationMenuItemId,
    );
    if (!isDefined(currentItem)) {
      return null;
    }
    const folderId = currentItem.folderId ?? null;
    return currentItems
      .filter(
        (item) =>
          (item.folderId ?? null) === folderId && visibleItemIds.has(item.id),
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

    if (isNavigationMenuItemFolder(itemToRemove)) {
      const childIds = currentItems
        .filter((item) => item.folderId === navigationMenuItemId)
        .map((item) => item.id);
      await deleteItems([navigationMenuItemId, ...childIds]);
      return;
    }

    await deleteItems([navigationMenuItemId]);
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

    const itemsInTargetFolder = currentItems.filter((item) =>
      targetFolderId === null
        ? !isDefined(item.folderId)
        : item.folderId === targetFolderId,
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

  return { moveUp, moveDown, remove, moveToFolder };
};
