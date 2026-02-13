import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import {
  matchesWorkspaceFolderId,
  validateAndExtractWorkspaceFolderId,
} from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';

import { isDefined } from 'twenty-shared/utils';
import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';

export const useHandleWorkspaceNavigationMenuItemDragAndDrop = () => {
  const { workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const isNavigationMenuInEditMode = useRecoilValue(
    isNavigationMenuInEditModeState,
  );
  const navigationMenuItemsDraft = useRecoilValue(
    navigationMenuItemsDraftState,
  );
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );
  const setOpenNavigationMenuItemFolderIds = useSetRecoilState(
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
    result,
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
    let reorderedDestinationList: NavigationMenuItem[];

    if (isSameList) {
      const listWithoutDragged = sourceList.filter(
        (item) => item.id !== draggableId,
      );
      reorderedDestinationList = [
        ...listWithoutDragged.slice(0, destination.index),
        draggedItem,
        ...listWithoutDragged.slice(destination.index),
      ];
    } else {
      const destinationListWithInsertedItem = [
        ...destinationList.slice(0, destination.index),
        { ...draggedItem, folderId: destinationFolderId },
        ...destinationList.slice(destination.index),
      ];
      reorderedDestinationList = destinationListWithInsertedItem;
    }

    const destinationWithNormalizedPositions = reorderedDestinationList.map(
      (item, index) => ({
        ...item,
        position: index,
        folderId: isSameList ? item.folderId : destinationFolderId,
      }),
    );

    const positionUpdates = new Map<
      string,
      { position: number; folderId: string | null }
    >();
    destinationWithNormalizedPositions.forEach((item) => {
      positionUpdates.set(item.id, {
        position: item.position,
        folderId: item.folderId ?? null,
      });
    });

    if (!isSameList) {
      const sourceListWithoutDragged = sourceList.filter(
        (item) => item.id !== draggableId,
      );
      sourceListWithoutDragged.forEach((item, index) => {
        positionUpdates.set(item.id, {
          position: index,
          folderId: sourceFolderId,
        });
      });
    }

    const updatedDraft = navigationMenuItemsDraft.map(
      (item): NavigationMenuItem => {
        const update = positionUpdates.get(item.id);
        if (!update) return item;
        return {
          ...item,
          position: update.position,
          folderId: update.folderId,
        };
      },
    );

    setNavigationMenuItemsDraft(updatedDraft);
  };

  return { handleWorkspaceNavigationMenuItemDragAndDrop };
};
