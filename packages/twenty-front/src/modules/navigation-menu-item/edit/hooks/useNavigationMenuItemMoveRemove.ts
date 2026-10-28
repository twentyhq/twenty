import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION } from '@/navigation-menu-item/common/constants/NavigationMenuContainerItemsSectionPosition';
import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
import { getNavigationMenuItemPositionNextTo } from '@/navigation-menu-item/common/utils/getNavigationMenuItemPositionNextTo';
import { getPositionBetween } from '@/navigation-menu-item/common/utils/getPositionBetween';
import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemContainer } from '@/navigation-menu-item/common/utils/isNavigationMenuItemContainer';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuItemEditSectionItems } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditSectionItems';

const CONTAINER_ITEMS_SIBLING_ID = 'container-items';

export const useNavigationMenuItemMoveRemove = (
  section: NavigationMenuItemSection,
) => {
  const { currentItems, updateItem, deleteItems } =
    useNavigationMenuItemEditController(section);
  const items = useNavigationMenuItemEditSectionItems(section);
  const visibleItemIds = new Set(items.map((item) => item.id));

  const getSortedSiblings = (
    navigationMenuItemId: string,
  ): Pick<NavigationMenuItem, 'id' | 'position'>[] | null => {
    const currentItem = currentItems.find(
      (item) => item.id === navigationMenuItemId,
    );
    if (!isDefined(currentItem)) {
      return null;
    }
    const folderId = currentItem.folderId ?? null;
    const isTabOrSection = isNavigationMenuItemContainer(currentItem);
    const isSection = isNavigationMenuItemAnySection(currentItem);
    const isSameKind = (item: NavigationMenuItem) =>
      isSection
        ? isNavigationMenuItemAnySection(item)
        : item.type === currentItem.type;
    const siblings: Pick<NavigationMenuItem, 'id' | 'position'>[] =
      currentItems.filter(
        (item) =>
          (item.folderId ?? null) === folderId &&
          (isTabOrSection ? isSameKind(item) : visibleItemIds.has(item.id)),
      );

    return (
      isSection
        ? [
            ...siblings,
            {
              id: CONTAINER_ITEMS_SIBLING_ID,
              position: NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION,
            },
          ]
        : siblings
    ).sort((a, b) => a.position - b.position);
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

  const moveNextTo = async (
    navigationMenuItemId: string,
    targetNavigationMenuItemId: string,
  ) => {
    const sortedSiblings = getSortedSiblings(navigationMenuItemId);
    if (!isDefined(sortedSiblings)) {
      return;
    }
    const position = getNavigationMenuItemPositionNextTo({
      sortedSiblings,
      navigationMenuItemId,
      targetNavigationMenuItemId,
    });
    if (!isDefined(position)) {
      return;
    }
    await updateItem(navigationMenuItemId, { position });
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

  const moveToContainer = async (
    navigationMenuItemId: string,
    targetContainerId: string | null,
  ) => {
    const itemToMove = currentItems.find(
      (item) => item.id === navigationMenuItemId,
    );
    if (!isDefined(itemToMove)) {
      return;
    }

    const isFolder = isNavigationMenuItemFolder(itemToMove);
    if (isFolder && targetContainerId === navigationMenuItemId) {
      return;
    }

    // Block moving a folder into one of its own descendants (would orphan the subtree).
    if (isFolder && isDefined(targetContainerId)) {
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
      if (descendantFolderIds.has(targetContainerId)) {
        return;
      }
    }

    const itemsInTargetFolder = currentItems.filter(
      (item) =>
        (item.folderId ?? null) === targetContainerId &&
        isNavigationMenuItemContainer(item) ===
          isNavigationMenuItemContainer(itemToMove),
    );
    const maxPositionInTarget = Math.max(
      -1,
      ...itemsInTargetFolder.map((item) => item.position),
    );

    await updateItem(navigationMenuItemId, {
      folderId: targetContainerId ?? null,
      position: maxPositionInTarget + 1,
    });
  };

  return {
    items,
    getSortedSiblings,
    moveUp,
    moveDown,
    moveNextTo,
    remove,
    moveToContainer,
  };
};
