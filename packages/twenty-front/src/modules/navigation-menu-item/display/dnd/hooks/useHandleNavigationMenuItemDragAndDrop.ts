import { useStore } from 'jotai';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/NavigationMenuItemDropResult';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useUpdateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useUpdateManyNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { computeDndReorderPosition } from '@/navigation-menu-item/common/utils/computeDndReorderPosition';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { resolveNavigationMenuItemDroppableId } from '@/navigation-menu-item/common/utils/resolveNavigationMenuItemDroppableId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const matchesParentId = (
  item: { parentId?: string | null },
  parentId: string | null,
): boolean => (item.parentId ?? null) === parentId;

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

    const destinationTarget = resolveNavigationMenuItemDroppableId(
      destination.droppableId,
      section,
    );
    const destinationParentId = destinationTarget?.parentId ?? null;
    const sourceParentId =
      resolveNavigationMenuItemDroppableId(source.droppableId, section)
        ?.parentId ?? null;

    const isDestinationFolder =
      destinationTarget?.kind === 'folder' ||
      destinationTarget?.kind === 'folderHeader';

    if (isNavigationMenuItemFolder(draggedItem) && isDestinationFolder) {
      return;
    }

    if (destinationTarget?.kind === 'folderHeader') {
      if (destinationParentId === null) {
        throw new Error(doNotTranslate('Invalid folder header ID'));
      }

      const folderList = getSortedItems().filter((item) =>
        matchesParentId(item, destinationParentId),
      );

      await computeAndApplyReorder(
        draggableId,
        folderList,
        folderList.length,
        destinationParentId,
      );
      setOpenNavigationMenuItemFolderIds((current) =>
        current.includes(destinationParentId)
          ? current
          : [...current, destinationParentId],
      );
      return;
    }

    const isSameParent = sourceParentId === destinationParentId;

    const destinationList = getSortedItems().filter(
      (item) =>
        matchesParentId(item, destinationParentId) &&
        !isNavigationMenuItemTabOrSection(item),
    );

    if (
      isSameParent &&
      !destinationList.some((item) => item.id === draggableId)
    ) {
      return;
    }

    const insertBeforeIndex = isDefined(result.insertBeforeItemId)
      ? destinationList.findIndex(
          (item) => item.id === result.insertBeforeItemId,
        )
      : -1;

    await computeAndApplyReorder(
      draggableId,
      destinationList,
      insertBeforeIndex >= 0 ? insertBeforeIndex : destination.index,
      isSameParent ? undefined : destinationParentId,
    );
  };

  return { handleNavigationMenuItemDragAndDrop };
};
