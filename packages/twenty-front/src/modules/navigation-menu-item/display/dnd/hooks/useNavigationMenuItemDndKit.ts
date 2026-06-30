import { type DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { useStore } from 'jotai';
import { type ComponentProps, useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/common/constants/AddToNavSourceDroppableId';
import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/common/states/addToNavPayloadRegistryState';
import type { DraggableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDraggableData';
import type { DropDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDropDestination';
import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/navigationMenuItemDropResult';
import type { SortableTargetDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitSortableTargetDestination';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { extractFolderIdFromDroppableId } from '@/navigation-menu-item/common/utils/extractFolderIdFromDroppableId';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useHandleAddToNavigationDrop } from '@/navigation-menu-item/display/dnd/hooks/useHandleAddToNavigationDrop';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/display/dnd/hooks/useHandleNavigationMenuItemDragAndDrop';
import { resolveDropTarget } from '@/navigation-menu-item/display/dnd/utils/navigationMenuItemDndKitResolveDropTarget';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemsDraftState';

type DragStartPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DraggableData>>['onDragStart']
  >
>[0];
type DragOverPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DraggableData>>['onDragOver']
  >
>[0];
type DragEndPayload = Parameters<
  NonNullable<
    ComponentProps<typeof DragDropProvider<DraggableData>>['onDragEnd']
  >
>[0];

export type NavigationMenuItemDndKitContextValues = {
  dragSource: { sourceDroppableId: string | null };
  drag: { isDragging: boolean };
  dropTarget: {
    activeDropTargetId: string | null;
    setActiveDropTargetId: (id: string | null) => void;
    forbiddenDropTargetId: string | null;
    setForbiddenDropTargetId: (id: string | null) => void;
    addToNavigationFallbackDestination: DropDestination | null;
  };
};

export const useNavigationMenuItemDndKit = (
  section: NavigationSections,
): {
  contextValues: NavigationMenuItemDndKitContextValues;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragOver: (event: DragOverPayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
  const sectionType: NavigationMenuItemSection =
    section === NavigationSections.FAVORITES ? 'favorite' : 'workspace';
  const isWorkspaceSection = sectionType === 'workspace';

  const store = useStore();

  const [isDragging, setIsDragging] = useState(false);
  const [sourceDroppableId, setSourceDroppableId] = useState<string | null>(
    null,
  );
  const [activeDropTargetId, setActiveDropTargetId] = useState<string | null>(
    null,
  );
  const [forbiddenDropTargetId, setForbiddenDropTargetId] = useState<
    string | null
  >(null);
  const [
    addToNavigationFallbackDestination,
    setAddToNavigationFallbackDestination,
  ] = useState<DropDestination | null>(null);

  const { navigationMenuItems } = useNavigationMenuItemsData();
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const { handleAddToNavigationDrop } = useHandleAddToNavigationDrop();
  const { handleNavigationMenuItemDragAndDrop } =
    useHandleNavigationMenuItemDragAndDrop(sectionType);

  const items = isWorkspaceSection
    ? workspaceNavigationMenuItems
    : navigationMenuItems;

  const orphanItems = isWorkspaceSection
    ? workspaceNavigationMenuItems
    : navigationMenuItemsSorted;

  const orphanItemCount = orphanItems.filter(
    (item: { folderId?: string | null }) => !isDefined(item.folderId),
  ).length;

  const { orphanDroppableId: defaultOrphanDroppableId } =
    NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[sectionType];

  const getNavItemById = useCallback(
    (id: string | undefined) =>
      id ? items.find((item) => item.id === id) : undefined,
    [items],
  );

  const getAddToNavPayload = useCallback(
    (sourceId: unknown) =>
      store.get(addToNavPayloadRegistryState.atom).get(String(sourceId)) ??
      null,
    [store],
  );

  const isSourceFolderDrag = useCallback(
    (source: { id?: unknown; data?: unknown } | null): boolean => {
      const sourceItem = getNavItemById(
        source?.id != null ? String(source.id) : undefined,
      );
      if (isDefined(sourceItem) && isNavigationMenuItemFolder(sourceItem)) {
        return true;
      }
      const payload = getAddToNavPayload(source?.id);
      return payload?.type === 'FOLDER';
    },
    [getNavItemById, getAddToNavPayload],
  );

  const computeForbiddenTargetId = useCallback(
    (
      source: { id?: unknown; data?: unknown } | null,
      resolved: SortableTargetDestination,
      isAddToNavDrag: boolean,
    ): string | null => {
      const sourceIsFolder = isAddToNavDrag
        ? getAddToNavPayload(source?.id)?.type === 'FOLDER'
        : isSourceFolderDrag(source);

      if (!sourceIsFolder) {
        return null;
      }

      if (resolved.isTargetFolder) {
        return resolved.effectiveDropTargetId;
      }

      const destFolderId = extractFolderIdFromDroppableId(
        resolved.destination.droppableId,
        sectionType,
      );
      if (isDefined(destFolderId)) {
        return resolved.dropTargetId;
      }

      return null;
    },
    [sectionType, getAddToNavPayload, isSourceFolderDrag],
  );

  const applyWorkspaceReorder = useCallback(
    (
      id: string,
      source: DropDestination,
      destination: DropDestination,
      insertBeforeItemId?: string | null,
    ) => {
      const result: NavigationMenuItemDropResult = {
        draggableId: id,
        source,
        destination,
        ...(insertBeforeItemId != null && { insertBeforeItemId }),
      };
      handleNavigationMenuItemDragAndDrop(result);
    },
    [handleNavigationMenuItemDragAndDrop],
  );

  const handleDragStart = (event: DragStartPayload) => {
    const { operation } = event;
    setIsDragging(true);
    const source = operation.source;
    const sourceId = source?.data?.sourceDroppableId ?? null;
    setSourceDroppableId(sourceId);

    if (sourceId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      const defaultDestination: DropDestination = {
        droppableId: defaultOrphanDroppableId,
        index: orphanItemCount,
      };
      setAddToNavigationFallbackDestination(defaultDestination);
      setActiveDropTargetId(
        getDndKitDropTargetId(
          defaultDestination.droppableId,
          defaultDestination.index,
        ),
      );
    }
  };

  const handleDragOver = useCallback(
    (event: DragOverPayload) => {
      const { operation } = event;
      const source = operation.source;
      const target = operation.target;
      const isAddToNavDrag =
        sourceDroppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID;
      const sourceIsSortable = source !== null && isSortable(source);
      const resolved = resolveDropTarget(target, getNavItemById, sectionType);

      // Branch 1: sortable-to-sortable
      if (
        resolved !== null &&
        source !== null &&
        target !== null &&
        isSortable(source) &&
        isSortable(target)
      ) {
        const forbiddenId = isAddToNavDrag
          ? computeForbiddenTargetId(source, resolved, true)
          : computeForbiddenTargetId(source, resolved, false);

        setActiveDropTargetId(resolved.dropTargetId);
        setForbiddenDropTargetId(forbiddenId);
        return;
      }

      // Branch 2: sortable-to-droppable-slot (includes insert-before zones)
      if (resolved !== null && sourceIsSortable) {
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        setAddToNavigationFallbackDestination(resolved.destination);
        setForbiddenDropTargetId(
          computeForbiddenTargetId(source, resolved, isAddToNavDrag),
        );
        return;
      }

      if (!isAddToNavDrag) {
        return;
      }

      // Branch 3: add-to-nav drag over droppable
      if (resolved !== null) {
        setAddToNavigationFallbackDestination(resolved.destination);
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        setForbiddenDropTargetId(
          computeForbiddenTargetId(source, resolved, true),
        );
        return;
      }

      const fallback = addToNavigationFallbackDestination;
      setActiveDropTargetId(
        fallback
          ? getDndKitDropTargetId(fallback.droppableId, fallback.index)
          : null,
      );
      setForbiddenDropTargetId(null);
    },
    [
      sourceDroppableId,
      addToNavigationFallbackDestination,
      getNavItemById,
      sectionType,
      computeForbiddenTargetId,
    ],
  );

  const handleDragEnd = (event: DragEndPayload) => {
    const { operation } = event;
    const source = operation.source;
    const target = operation.target;
    const draggableId = String(source?.id);
    const data = source?.data;
    const sourceId = data?.sourceDroppableId ?? null;
    const fallback = addToNavigationFallbackDestination;

    setIsDragging(false);
    setSourceDroppableId(null);
    setActiveDropTargetId(null);
    setForbiddenDropTargetId(null);
    setAddToNavigationFallbackDestination(null);

    const sourceIsSortable = source !== null && isSortable(source);
    const targetIsSortable = target !== null && isSortable(target);
    const resolved = resolveDropTarget(target, getNavItemById, sectionType);

    // Workspace fast path: sortable-to-sortable within workspace
    if (
      isWorkspaceSection &&
      sourceIsSortable &&
      targetIsSortable &&
      isDefined(source) &&
      isDefined(target) &&
      resolved !== null
    ) {
      const sourceDraggable = 'initialGroup' in source ? source : null;
      const initialGroup = String(sourceDraggable?.initialGroup ?? '');
      const initialIndex = sourceDraggable?.initialIndex ?? 0;
      const destGroup = String(target.group ?? '');
      const bothWorkspace =
        canNavigationMenuItemBeDroppedIn({
          navigationMenuItemSection: 'workspace',
          droppableId: initialGroup,
        }) &&
        canNavigationMenuItemBeDroppedIn({
          navigationMenuItemSection: 'workspace',
          droppableId: destGroup,
        });
      if (bothWorkspace) {
        const insertBeforeItemId =
          target?.id != null ? String(target.id) : undefined;
        applyWorkspaceReorder(
          draggableId,
          { droppableId: initialGroup, index: initialIndex },
          resolved.destination,
          insertBeforeItemId,
        );
        return;
      }
    }

    let destination: DropDestination | null = resolved?.destination ?? null;
    const insertBeforeItemId = resolved?.insertBeforeItemId;

    if (
      destination == null &&
      isDefined(fallback) &&
      canNavigationMenuItemBeDroppedIn({
        navigationMenuItemSection: sectionType,
        droppableId: fallback.droppableId,
      })
    ) {
      destination = fallback;
    }

    const dropResult: NavigationMenuItemDropResult = {
      draggableId,
      source: {
        droppableId: data?.sourceDroppableId ?? '',
        index: data?.sourceIndex ?? 0,
      },
      destination,
      ...(insertBeforeItemId != null && { insertBeforeItemId }),
    };

    if (sourceId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      handleAddToNavigationDrop(dropResult);
      return;
    }

    if (isWorkspaceSection) {
      if (
        isDefined(sourceId) &&
        canNavigationMenuItemBeDroppedIn({
          navigationMenuItemSection: 'workspace',
          droppableId: sourceId,
        }) &&
        isDefined(destination) &&
        canNavigationMenuItemBeDroppedIn({
          navigationMenuItemSection: 'workspace',
          droppableId: destination.droppableId,
        })
      ) {
        applyWorkspaceReorder(
          draggableId,
          {
            droppableId: data?.sourceDroppableId ?? '',
            index: data?.sourceIndex ?? 0,
          },
          destination,
          insertBeforeItemId,
        );
      }
      return;
    }

    handleNavigationMenuItemDragAndDrop(dropResult);
  };

  const contextValues: NavigationMenuItemDndKitContextValues = {
    dragSource: { sourceDroppableId },
    drag: { isDragging },
    dropTarget: {
      activeDropTargetId,
      setActiveDropTargetId,
      forbiddenDropTargetId,
      setForbiddenDropTargetId,
      addToNavigationFallbackDestination,
    },
  };

  return {
    contextValues,
    handlers: {
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
    },
  };
};
