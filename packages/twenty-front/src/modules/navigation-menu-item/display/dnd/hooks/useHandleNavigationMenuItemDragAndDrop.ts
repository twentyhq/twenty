import { useStore } from 'jotai';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/NavigationMenuItemDropResult';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { computeNavigationMenuItemDropPlacement } from '@/navigation-menu-item/common/utils/computeNavigationMenuItemDropPlacement';
import { resolveNavigationMenuItemDroppableId } from '@/navigation-menu-item/common/utils/resolveNavigationMenuItemDroppableId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

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
  const allItems = isDraftMode
    ? workspaceNavigationMenuItems
    : navigationMenuItems;

  const getSortedItems = (): Array<
    Pick<NavigationMenuItem, 'id' | 'position' | 'parentId' | 'type'>
  > =>
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
      newFolderId !== undefined ? { parentId: newFolderId } : {};

    if (isDraftMode) {
      const draft = store.get(navigationMenuItemsDraftState.atom);
      if (!draft) {
        return;
      }

      setNavigationMenuItemsDraft(
        draft.map((item): NavigationMenuItem => {
          if (item.id !== draggableId) {
            return item;
          }
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

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!isDropAllowed(source.droppableId, destination.droppableId)) {
      return;
    }

    const draggedItem = allItems.find((item) => item.id === draggableId);
    if (!draggedItem) {
      return;
    }

    const getNavigationMenuItemById = (id: string) =>
      allItems.find((item) => item.id === id);
    const destinationTarget = resolveNavigationMenuItemDroppableId({
      droppableId: destination.droppableId,
      navigationMenuItemSection: section,
      getNavigationMenuItemById,
    });
    if (!isDefined(destinationTarget)) {
      return;
    }

    const sourceParentId =
      resolveNavigationMenuItemDroppableId({
        droppableId: source.droppableId,
        navigationMenuItemSection: section,
        getNavigationMenuItemById,
      })?.parentId ?? null;

    const placement = computeNavigationMenuItemDropPlacement({
      draggedItem,
      sourceParentId,
      destinationTarget,
      destinationIndex: destination.index,
      insertBeforeItemId: result.insertBeforeItemId,
      sortedItems: getSortedItems(),
    });

    if (!isDefined(placement)) {
      return;
    }

    await applyReorder(draggableId, placement.position, placement.parentId);

    const { folderIdToOpen } = placement;

    if (isDefined(folderIdToOpen)) {
      setOpenNavigationMenuItemFolderIds((current) =>
        current.includes(folderIdToOpen)
          ? current
          : [...current, folderIdToOpen],
      );
    }
  };

  return { handleNavigationMenuItemDragAndDrop };
};
