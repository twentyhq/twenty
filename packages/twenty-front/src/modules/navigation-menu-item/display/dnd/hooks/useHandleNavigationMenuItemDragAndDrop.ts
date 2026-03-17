import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useUpdateNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useUpdateNavigationMenuItem';
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
): boolean =>
  (folderId === null && !isDefined(item.folderId)) ||
  (isDefined(folderId) && item.folderId === folderId);

export const useHandleNavigationMenuItemDragAndDrop = (
  section: NavigationMenuItemSection,
) => {
  const store = useStore();
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { updateNavigationMenuItem } = useUpdateNavigationMenuItem();
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const setOpenNavigationMenuItemFolderIds = useSetAtomState(
    openNavigationMenuItemFolderIdsState,
  );

  const isDraftMode = section === 'workspace';
  const config = NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[section];

  const getSortedItems = (): Array<{
    id: string;
    position: number;
    folderId?: string | null;
  }> => {
    if (isDraftMode) {
      return (store.get(navigationMenuItemsDraftState.atom) ?? []).sort(
        (a, b) => a.position - b.position,
      );
    }
    return navigationMenuItemsSorted;
  };

  const openDestinationFolder = (folderId: string | null) => {
    if (!folderId) {
      return;
    }

    setOpenNavigationMenuItemFolderIds((current) =>
      current.includes(folderId) ? current : [...current, folderId],
    );
  };

  const applyReorder = async (
    draggableId: string,
    newPosition: number,
    newFolderId?: string | null,
  ) => {
    if (isDraftMode) {
      const draft = store.get(navigationMenuItemsDraftState.atom);
      if (!draft) return;

      const updatedDraft = draft.map((item): NavigationMenuItem => {
        if (item.id !== draggableId) return item;
        return {
          ...item,
          position: newPosition,
          ...(newFolderId !== undefined ? { folderId: newFolderId } : {}),
        };
      });
      setNavigationMenuItemsDraft(updatedDraft);
    } else {
      await updateNavigationMenuItem({
        id: draggableId,
        position: newPosition,
        ...(newFolderId !== undefined ? { folderId: newFolderId } : {}),
      });
    }
  };

  const handleNavigationMenuItemDragAndDrop: OnDragEndResponder = async (
    result: Parameters<OnDragEndResponder>[0] & {
      insertBeforeItemId?: string | null;
    },
  ) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (isDraftMode) {
      const isWorkspaceDrop =
        source.droppableId.startsWith('workspace-') &&
        destination.droppableId.startsWith('workspace-');
      if (!isWorkspaceDrop) return;

      const isLayoutCustomizationModeEnabled = store.get(
        isLayoutCustomizationModeEnabledState.atom,
      );
      const draft = store.get(navigationMenuItemsDraftState.atom);
      if (!isLayoutCustomizationModeEnabled || !draft) return;
    } else {
      if (
        canNavigationMenuItemBeDroppedIn({
          navigationMenuItemSection: 'workspace',
          droppableId: destination.droppableId,
        })
      ) {
        return;
      }
    }

    const allItems = isDraftMode
      ? workspaceNavigationMenuItems
      : navigationMenuItems;
    const draggedItem = allItems.find((item) => item.id === draggableId);
    if (!draggedItem) {
      return;
    }

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

    const isDropOnFolderHeader = destination.droppableId.startsWith(
      config.folderHeaderPrefix,
    );

    if (isDropOnFolderHeader) {
      if (destinationFolderId === null) {
        throw new Error('Invalid folder header ID');
      }

      const folderList = getSortedItems().filter((item) =>
        matchesFolderId(item, destinationFolderId),
      );

      const newPosition = computeDndReorderPosition({
        sortedList: folderList,
        draggableId,
        sourceIndex: -1,
        destinationIndex: folderList.length,
        isSameList: false,
      });

      await applyReorder(draggableId, newPosition, destinationFolderId);
      openDestinationFolder(destinationFolderId);
      return;
    }

    const isSameList = sourceFolderId === destinationFolderId;

    if (isSameList) {
      const sourceList = getSortedItems().filter((item) =>
        matchesFolderId(item, sourceFolderId),
      );

      if (!sourceList.some((item) => item.id === draggableId)) {
        return;
      }

      const insertBeforeIndex =
        result.insertBeforeItemId != null
          ? sourceList.findIndex(
              (item) => item.id === result.insertBeforeItemId,
            )
          : -1;
      const sourceIndexInList = sourceList.findIndex(
        (item) => item.id === draggableId,
      );
      const destinationIndex =
        insertBeforeIndex >= 0 ? insertBeforeIndex : destination.index;

      const newPosition = computeDndReorderPosition({
        sortedList: sourceList,
        draggableId,
        sourceIndex:
          sourceIndexInList >= 0 ? sourceIndexInList : source.index,
        destinationIndex,
        isSameList: true,
      });

      await applyReorder(draggableId, newPosition);
      return;
    }

    const destinationList = getSortedItems().filter((item) =>
      matchesFolderId(item, destinationFolderId),
    );

    const newPosition = computeDndReorderPosition({
      sortedList: destinationList,
      draggableId,
      sourceIndex: -1,
      destinationIndex: destination.index,
      isSameList: false,
    });

    await applyReorder(draggableId, newPosition, destinationFolderId ?? null);
  };

  return { handleNavigationMenuItemDragAndDrop };
};
