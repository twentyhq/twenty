import { useStore } from 'jotai';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/NavigationMenuItemDropResult';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';
import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { computeDndReorderPosition } from '@/navigation-menu-item/common/utils/computeDndReorderPosition';
import { extractContainerIdFromDroppableId } from '@/navigation-menu-item/common/utils/extractContainerIdFromDroppableId';
import { isNavigationMenuItemAlreadyInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAlreadyInSection';
import { isNavigationMenuItemPinnedCommands } from '@/navigation-menu-item/common/utils/isNavigationMenuItemPinnedCommands';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemContainer } from '@/navigation-menu-item/common/utils/isNavigationMenuItemContainer';
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

  const getSortedItems = (): Array<
    Pick<NavigationMenuItem, 'id' | 'position' | 'folderId' | 'type'>
  > =>
    (isDraftMode
      ? [...(store.get(navigationMenuItemsDraftState.atom) ?? [])].sort(
          (a, b) => a.position - b.position,
        )
      : navigationMenuItemsSorted
    ).filter((item) => !isNavigationMenuItemContainer(item));

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

    const destinationContainerId = extractContainerIdFromDroppableId(
      destination.droppableId,
      section,
    );
    const sourceContainerId = extractContainerIdFromDroppableId(
      source.droppableId,
      section,
    );

    if (
      isNavigationMenuItemAlreadyInSection({
        items: allItems,
        itemId: draggableId,
        containerId: destinationContainerId,
      })
    ) {
      return;
    }

    const destinationParent = allItems.find(
      (item) => item.id === destinationContainerId,
    );

    if (
      isDraftMode &&
      isNavigationMenuItemFolder(draggedItem) &&
      isDefined(destinationParent) &&
      isNavigationMenuItemFolder(destinationParent)
    ) {
      return;
    }

    const isPinnedCommandsDestination =
      isDefined(destinationParent) &&
      isNavigationMenuItemPinnedCommands(destinationParent);

    if (
      (draggedItem.type === NavigationMenuItemType.COMMAND) !==
      isPinnedCommandsDestination
    ) {
      return;
    }

    if (destination.droppableId.startsWith(config.folderHeaderPrefix)) {
      if (destinationContainerId === null) {
        throw new Error(doNotTranslate('Invalid folder header ID'));
      }

      const folderList = getSortedItems().filter((item) =>
        matchesFolderId(item, destinationContainerId),
      );

      await computeAndApplyReorder(
        draggableId,
        folderList,
        folderList.length,
        destinationContainerId,
      );
      setOpenNavigationMenuItemFolderIds((current) =>
        current.includes(destinationContainerId)
          ? current
          : [...current, destinationContainerId],
      );
      return;
    }

    const isSameContainer = sourceContainerId === destinationContainerId;

    const destinationList = getSortedItems().filter((item) =>
      matchesFolderId(item, destinationContainerId),
    );

    if (
      isSameContainer &&
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
      isSameContainer ? undefined : (destinationContainerId ?? null),
    );
  };

  return { handleNavigationMenuItemDragAndDrop };
};
