import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { getPositionBetween } from '@/navigation-menu-item/utils/getPositionBetween';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import {
  matchesWorkspaceFolderId,
  validateAndExtractWorkspaceFolderId,
} from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { isDefined } from 'twenty-shared/utils';
import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useHandleWorkspaceNavigationMenuItemDragAndDrop = () => {
  const store = useStore();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const setOpenNavigationMenuItemFolderIds = useSetAtomState(
    openNavigationMenuItemFolderIdsState,
  );

  const openDestinationFolder = (folderId: string | null) => {
    if (!folderId) {
      return;
    }

    setOpenNavigationMenuItemFolderIds((current) => {
      if (!current.includes(folderId)) {
        return [...current, folderId];
      }
      return current;
    });
  };

  const handleWorkspaceNavigationMenuItemDragAndDrop: OnDragEndResponder = (
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

    const isWorkspaceDrop =
      source.droppableId.startsWith('workspace-') &&
      destination.droppableId.startsWith('workspace-');

    if (!isWorkspaceDrop) {
      return;
    }

    const navigationMenuItemsDraft = store.get(
      navigationMenuItemsDraftState.atom,
    );
    const isNavigationMenuInEditMode = store.get(
      isNavigationMenuInEditModeState.atom,
    );
    if (!isNavigationMenuInEditMode || !navigationMenuItemsDraft) {
      return;
    }

    const draggedItem = workspaceNavigationMenuItems.find(
      (item) => item.id === draggableId,
    );

    if (!draggedItem) {
      return;
    }

    const destinationFolderId = validateAndExtractWorkspaceFolderId(
      destination.droppableId,
    );

    if (
      isNavigationMenuItemFolder(draggedItem) &&
      isDefined(destinationFolderId)
    ) {
      return;
    }
    const sourceFolderId = validateAndExtractWorkspaceFolderId(
      source.droppableId,
    );

    const isDropOnFolderHeader = destination.droppableId.startsWith(
      NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX,
    );

    if (isDropOnFolderHeader && isDefined(destinationFolderId)) {
      openDestinationFolder(destinationFolderId);
    }

    const sourceList = (navigationMenuItemsDraft ?? [])
      .filter((item) => matchesWorkspaceFolderId(item, sourceFolderId))
      .sort((a, b) => a.position - b.position);

    const destinationList = (navigationMenuItemsDraft ?? [])
      .filter((item) => matchesWorkspaceFolderId(item, destinationFolderId))
      .sort((a, b) => a.position - b.position);

    if (!sourceList.some((item) => item.id === draggableId)) {
      return;
    }

    const isSameList = sourceFolderId === destinationFolderId;

    if (isSameList) {
      const listWithoutDragged = sourceList.filter(
        (item) => item.id !== draggableId,
      );
      const sourceIndexInList = sourceList.findIndex(
        (item) => item.id === draggableId,
      );
      const insertBeforeIndex =
        result.insertBeforeItemId != null
          ? sourceList.findIndex(
              (item) => item.id === result.insertBeforeItemId,
            )
          : -1;
      const destinationIndexInFullList =
        insertBeforeIndex >= 0 ? insertBeforeIndex : destination.index;
      const destIndexInListWithoutDragged =
        sourceIndexInList < destinationIndexInFullList &&
        destinationIndexInFullList <= listWithoutDragged.length
          ? destinationIndexInFullList - 1
          : destinationIndexInFullList;
      const prevItem = listWithoutDragged[destIndexInListWithoutDragged - 1];
      const nextItem = listWithoutDragged[destIndexInListWithoutDragged];
      const newPosition = getPositionBetween(
        prevItem?.position,
        nextItem?.position,
      );
      const updatedDraft = navigationMenuItemsDraft.map(
        (item): NavigationMenuItem =>
          item.id === draggableId ? { ...item, position: newPosition } : item,
      );
      setNavigationMenuItemsDraft(updatedDraft);
      return;
    }

    const prevItem = destinationList[destination.index - 1];
    const nextItem = destinationList[destination.index];
    const newPosition = getPositionBetween(
      prevItem?.position,
      nextItem?.position,
    );
    const updatedDraft = navigationMenuItemsDraft.map(
      (item): NavigationMenuItem => {
        if (item.id !== draggableId) return item;
        return {
          ...item,
          position: newPosition,
          folderId: destinationFolderId,
        };
      },
    );
    setNavigationMenuItemsDraft(updatedDraft);
  };

  return { handleWorkspaceNavigationMenuItemDragAndDrop };
};
