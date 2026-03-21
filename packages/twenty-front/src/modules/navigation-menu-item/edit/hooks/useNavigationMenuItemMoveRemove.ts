import { isDefined } from 'twenty-shared/utils';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { getPositionBetween } from '@/navigation-menu-item/common/utils/getPositionBetween';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';

export const useNavigationMenuItemMoveRemove = () => {
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const items = useNavigationMenuItemSectionItems();
  const visibleItemIds = new Set(items.map((item) => item.id));

  const moveUp = (navigationMenuItemId: string) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) {
        return draft;
      }

      const currentItem = draft.find(
        (item) => item.id === navigationMenuItemId,
      );
      if (!currentItem) {
        return draft;
      }

      const folderId = currentItem.folderId ?? null;
      const siblings = draft
        .filter(
          (item) =>
            (item.folderId ?? null) === folderId && visibleItemIds.has(item.id),
        )
        .sort((a, b) => a.position - b.position);

      const currentIndex = siblings.findIndex(
        (item) => item.id === navigationMenuItemId,
      );
      if (currentIndex <= 0) {
        return draft;
      }

      const prev = siblings[currentIndex - 1];
      const prevPrev = siblings[currentIndex - 2];
      const newPosition = getPositionBetween(prevPrev?.position, prev.position);

      return draft.map((item) =>
        item.id === navigationMenuItemId
          ? { ...item, position: newPosition }
          : item,
      );
    });
  };

  const moveDown = (navigationMenuItemId: string) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) {
        return draft;
      }

      const currentItem = draft.find(
        (item) => item.id === navigationMenuItemId,
      );
      if (!currentItem) {
        return draft;
      }

      const folderId = currentItem.folderId ?? null;
      const siblings = draft
        .filter(
          (item) =>
            (item.folderId ?? null) === folderId && visibleItemIds.has(item.id),
        )
        .sort((a, b) => a.position - b.position);

      const currentIndex = siblings.findIndex(
        (item) => item.id === navigationMenuItemId,
      );
      if (currentIndex < 0 || currentIndex >= siblings.length - 1) {
        return draft;
      }

      const next = siblings[currentIndex + 1];
      const nextNext = siblings[currentIndex + 2];
      const newPosition = getPositionBetween(next.position, nextNext?.position);

      return draft.map((item) =>
        item.id === navigationMenuItemId
          ? { ...item, position: newPosition }
          : item,
      );
    });
  };

  const remove = (navigationMenuItemId: string) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) {
        return draft;
      }

      const itemToRemove = draft.find(
        (item) => item.id === navigationMenuItemId,
      );
      if (!itemToRemove) {
        return draft;
      }

      const isFolder = isNavigationMenuItemFolder(itemToRemove);

      if (isFolder) {
        return draft.filter(
          (item) =>
            item.id !== navigationMenuItemId &&
            item.folderId !== navigationMenuItemId,
        );
      }

      return draft.filter((item) => item.id !== navigationMenuItemId);
    });
  };

  const moveToFolder = (
    navigationMenuItemId: string,
    targetFolderId: string | null,
  ) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) {
        return draft;
      }

      const itemToMove = draft.find((item) => item.id === navigationMenuItemId);
      if (!itemToMove) {
        return draft;
      }

      const isFolder = isNavigationMenuItemFolder(itemToMove);
      if (isFolder && targetFolderId === navigationMenuItemId) {
        return draft;
      }

      if (isFolder && isDefined(targetFolderId)) {
        const descendantFolderIds = new Set<string>();
        const collectDescendants = (folderId: string) => {
          draft
            ?.filter(
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
          return draft;
        }
      }

      const itemsInTargetFolder = draft.filter((item) =>
        targetFolderId === null
          ? !isDefined(item.folderId)
          : item.folderId === targetFolderId,
      );
      const maxPositionInTarget =
        itemsInTargetFolder.length > 0
          ? Math.max(...itemsInTargetFolder.map((item) => item.position))
          : -1;
      const newPosition = maxPositionInTarget + 1;

      return draft.map((item) =>
        item.id === navigationMenuItemId
          ? {
              ...item,
              folderId: targetFolderId ?? undefined,
              position: newPosition,
            }
          : item,
      );
    });
  };

  return { moveUp, moveDown, remove, moveToFolder };
};
