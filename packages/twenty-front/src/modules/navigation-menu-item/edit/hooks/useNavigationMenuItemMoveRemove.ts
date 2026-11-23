import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { isDefined } from 'twenty-shared/utils';

import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
import { getNavigationMenuItemMovedPosition } from '@/navigation-menu-item/common/utils/getNavigationMenuItemMovedPosition';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useWorkspaceSidebarRootContainerId } from '@/navigation-menu-item/display/hooks/useWorkspaceSidebarRootContainerId';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuItemEditSectionItems } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditSectionItems';

export const useNavigationMenuItemMoveRemove = (
  section: NavigationMenuItemSection,
  containerId: string | null = null,
) => {
  const { currentItems, updateItem, deleteItems } =
    useNavigationMenuItemEditController(section);
  const items = useNavigationMenuItemEditSectionItems(section, containerId);
  const visibleItemIds = new Set(items.map((item) => item.id));
  const workspaceSidebarRootContainerId = useWorkspaceSidebarRootContainerId();
  const rootContainerId =
    section === 'workspace' ? workspaceSidebarRootContainerId : null;

  const getSortedSiblings = (navigationMenuItemId: string) => {
    const currentItem = currentItems.find(
      (item) => item.id === navigationMenuItemId,
    );
    if (!isDefined(currentItem)) {
      return null;
    }
    const parentId = currentItem.parentId ?? rootContainerId;
    return currentItems
      .filter(
        (item) =>
          (item.parentId ?? rootContainerId) === parentId &&
          visibleItemIds.has(item.id),
      )
      .sort((a, b) => a.position - b.position);
  };

  const move = async (navigationMenuItemId: string, offset: -1 | 1) => {
    const siblings = getSortedSiblings(navigationMenuItemId);
    if (!isDefined(siblings)) {
      return;
    }
    const position = getNavigationMenuItemMovedPosition({
      siblings,
      itemId: navigationMenuItemId,
      offset,
    });
    if (!isDefined(position)) {
      return;
    }
    await updateItem(navigationMenuItemId, { position });
  };

  const moveUp = (navigationMenuItemId: string) =>
    move(navigationMenuItemId, -1);

  const moveDown = (navigationMenuItemId: string) =>
    move(navigationMenuItemId, 1);

  const remove = async (navigationMenuItemId: string) => {
    const itemToRemove = currentItems.find(
      (item) => item.id === navigationMenuItemId,
    );
    if (!isDefined(itemToRemove)) {
      return;
    }

    await deleteItems([
      navigationMenuItemId,
      ...getNavigationMenuItemDescendantIds({
        items: currentItems,
        ancestorId: navigationMenuItemId,
      }),
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
      const collectDescendants = (parentId: string) => {
        currentItems
          .filter(
            (item) =>
              isNavigationMenuItemFolder(item) && item.parentId === parentId,
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
        ? !isDefined(item.parentId)
        : item.parentId === targetFolderId,
    );
    const maxPositionInTarget =
      itemsInTargetFolder.length > 0
        ? Math.max(...itemsInTargetFolder.map((item) => item.position))
        : -1;

    await updateItem(navigationMenuItemId, {
      parentId: targetFolderId ?? null,
      position: maxPositionInTarget + 1,
    });
  };

  return { items, getSortedSiblings, moveUp, moveDown, remove, moveToFolder };
};
