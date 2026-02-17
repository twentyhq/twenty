import { type OnDragEndResponder } from '@hello-pangea/dnd';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/hooks/useSortedNavigationMenuItems';
import { useUpdateNavigationMenuItem } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItem';
import { openNavigationMenuItemFolderIdsStateV2 } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { calculateNewPosition } from '@/ui/layout/draggable-list/utils/calculateNewPosition';
import { FOLDER_DROPPABLE_IDS } from '@/ui/layout/draggable-list/utils/folderDroppableIds';
import { validateAndExtractFolderId } from '@/ui/layout/draggable-list/utils/validateAndExtractFolderId';

import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';

export const useHandleNavigationMenuItemDragAndDrop = () => {
  const { navigationMenuItems } = usePrefetchedNavigationMenuItemsData();
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { updateNavigationMenuItem } = useUpdateNavigationMenuItem();
  const setOpenNavigationMenuItemFolderIds = useSetRecoilStateV2(
    openNavigationMenuItemFolderIdsStateV2,
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

  const handleNavigationMenuItemDragAndDrop: OnDragEndResponder = async (
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

    if (isWorkspaceDroppableId(destination.droppableId)) {
      return;
    }

    const draggedNavigationMenuItem = navigationMenuItems.find(
      (item) => item.id === draggableId,
    );
    if (!draggedNavigationMenuItem) {
      return;
    }

    const destinationFolderId = validateAndExtractFolderId({
      droppableId: destination.droppableId,
      orphanDroppableId:
        NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS,
    });
    const sourceFolderId = validateAndExtractFolderId({
      droppableId: source.droppableId,
      orphanDroppableId:
        NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS,
    });

    if (
      destination.droppableId.startsWith(
        FOLDER_DROPPABLE_IDS.FOLDER_HEADER_PREFIX,
      )
    ) {
      if (destinationFolderId === null)
        throw new Error('Invalid folder header ID');

      const folderNavigationMenuItems = navigationMenuItemsSorted.filter(
        (item) => item.folderId === destinationFolderId,
      );

      const newPosition =
        folderNavigationMenuItems.length === 0
          ? 1
          : folderNavigationMenuItems[folderNavigationMenuItems.length - 1]
              .position + 1;

      await updateNavigationMenuItem({
        id: draggableId,
        folderId: destinationFolderId,
        position: newPosition,
      });

      openDestinationFolder(destinationFolderId);
      return;
    }

    if (destination.droppableId !== source.droppableId) {
      const destinationNavigationMenuItems = navigationMenuItemsSorted.filter(
        (item) => item.folderId === destinationFolderId,
      );

      let newPosition;
      if (destinationNavigationMenuItems.length === 0) {
        newPosition = 1;
      } else if (destination.index === 0) {
        newPosition = destinationNavigationMenuItems[0].position - 1;
      } else if (destination.index >= destinationNavigationMenuItems.length) {
        newPosition =
          destinationNavigationMenuItems[
            destinationNavigationMenuItems.length - 1
          ].position + 1;
      } else {
        newPosition = calculateNewPosition({
          destinationIndex: destination.index,
          sourceIndex: -1,
          items: destinationNavigationMenuItems,
        });
      }

      await updateNavigationMenuItem({
        id: draggableId,
        folderId: destinationFolderId ?? null,
        position: newPosition,
      });
      return;
    }

    const navigationMenuItemsInSameList = navigationMenuItemsSorted
      .filter((item) => item.folderId === sourceFolderId)
      .filter((item) => item.id !== draggableId);

    const newPosition = calculateNewPosition({
      destinationIndex: destination.index,
      sourceIndex: source.index,
      items: navigationMenuItemsInSameList,
    });

    await updateNavigationMenuItem({
      id: draggableId,
      position: newPosition,
    });
  };

  return { handleNavigationMenuItemDragAndDrop };
};
