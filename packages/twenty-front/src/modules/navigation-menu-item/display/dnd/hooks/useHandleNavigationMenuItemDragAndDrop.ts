import { useStore } from 'jotai';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/navigationMenuItemDropResult';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';
import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { computeDndReorderPosition } from '@/navigation-menu-item/common/utils/computeDndReorderPosition';
import { extractFolderIdFromDroppableId } from '@/navigation-menu-item/common/utils/extractFolderIdFromDroppableId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const matchesFolderId = (
  item: { folderId?: string | null },
  folderId: string | null,
): boolean => (item.folderId ?? null) === folderId;

export const useHandleNavigationMenuItemDragAndDrop = (
  section: NavigationMenuItemSection,
) => {
  const store = useStore();
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { updateManyNavigationMenuItems } = useUpdateManyNavigationMenuItems();
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const setOpenNavigationMenuItemFolderIds = useSetAtomState(
    openNavigationMenuItemFolderIdsState,
  );

  const isDraftMode = section === 'workspace';
  const config = NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[section];
  const allItems = isDraftMode
    ? workspaceNavigationMenuItems
    : navigationMenuItems;

  const getSortedItems = (): Array<{
    id: string;
    position: number;
    folderId?: string | null;
  }> =>
    isDraftMode
      ? (store.get(navigationMenuItemsDraftState.atom) ?? []).sort(
          (a, b) => a.position - b.position,
        )
      : navigationMenuItemsSorted;

  const applyReorder = async (
    draggableId: string,
    newPosition: number,
    newFolderId?: string | null,
  ) => {
    const folderUpdate =
      newFolderId !== undefined ? { folderId: newFolderId } : {};

    if (isDraftMode) {
      const draft = store.get(navigationMenuItemsDraftState.atom);
      if (!draft) return;

      setNavigationMenuItemsDraft(
        draft.map((item): NavigationMenuItem => {
          if (item.id !== draggableId) return item;
          return { ...item, position: newPosition, ...folderUpdate };
        }),
      );
    } else {
      await updateManyNavigationMenuItems([
        {
          id: draggableId,
          update: { position: newPosition, ...folderUpdate },
        },
      ]);
    }
  };

  const computeAndApplyReorder = async (
    draggableId: string,
    list: Array<{ id: string; position: number }>,
    destinationIndex: number,
    newFolderId?: string | null,
  ) => {
    const newPosition = computeDndReorderPosition({
      sortedList: list,
      draggableId,
      destinationIndex,
    });
    await applyReorder(draggableId, newPosition, newFolderId);
  };

  const isDropAllowed = (
    sourceDroppableId: string,
    destinationDroppableId: string,
  ): boolean => {
    if (isDraftMode) {
      return (
        sourceDroppableId.startsWith('workspace-') &&
        destinationDroppableId.startsWith('workspace-') &&
        store.get(isLayoutCustomizationModeEnabledState.atom) &&
        isDefined(store.get(navigationMenuItemsDraftState.atom))
      );
    }

    return !canNavigationMenuItemBeDroppedIn({
      navigationMenuItemSection: 'workspace',
      droppableId: destinationDroppableId,
    });
  };

  const handleNavigationMenuItemDragAndDrop = async (
    result: NavigationMenuItemDropResult,
  ) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!isDropAllowed(source.droppableId, destination.droppableId)) return;

    const draggedItem = allItems.find((item) => item.id === draggableId);
    if (!draggedItem) return;

    const destinationFolderId = extractFolderIdFromDroppableId(
      destination.droppableId,
      section,
    );
    const sourceFolderId = extractFolderIdFromDroppableId(
      source.droppableId,
      section,
    );

    if (
      isDraftMode &&
      isNavigationMenuItemFolder(draggedItem) &&
      isDefined(destinationFolderId)
    ) {
      return;
    }

    if (destination.droppableId.startsWith(config.folderHeaderPrefix)) {
      if (destinationFolderId === null) {
        throw new Error('Invalid folder header ID');
      }

      const folderList = getSortedItems().filter((item) =>
        matchesFolderId(item, destinationFolderId),
      );

      await computeAndApplyReorder(
        draggableId,
        folderList,
        folderList.length,
        destinationFolderId,
      );
      setOpenNavigationMenuItemFolderIds((current) =>
        current.includes(destinationFolderId)
          ? current
          : [...current, destinationFolderId],
      );
      return;
    }

    const isSameFolder = sourceFolderId === destinationFolderId;

    const destinationList = getSortedItems().filter((item) =>
      matchesFolderId(item, destinationFolderId),
    );

    if (
      isSameFolder &&
      !destinationList.some((item) => item.id === draggableId)
    ) {
      return;
    }

    const insertBeforeIndex =
      result.insertBeforeItemId != null
        ? destinationList.findIndex(
            (item) => item.id === result.insertBeforeItemId,
          )
        : -1;

    await computeAndApplyReorder(
      draggableId,
      destinationList,
      insertBeforeIndex >= 0 ? insertBeforeIndex : destination.index,
      isSameFolder ? undefined : (destinationFolderId ?? null),
    );
  };

  return { handleNavigationMenuItemDragAndDrop };
};
