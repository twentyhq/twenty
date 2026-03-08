import { type DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import type { ResponderProvided } from '@hello-pangea/dnd';
import { type ComponentProps, useCallback, useState } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { useHandleAddToNavigationDrop } from '@/navigation-menu-item/hooks/useHandleAddToNavigationDrop';
import { useHandleWorkspaceNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleWorkspaceNavigationMenuItemDragAndDrop';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/states/addToNavPayloadRegistryState';
import { getDndKitDropTargetId } from '@/navigation-menu-item/utils/getDndKitDropTargetId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';

import { DROP_RESULT_OPTIONS } from '@/navigation/constants/workspaceDndKitDropResultOptions';
import type { DraggableData } from '@/navigation/types/workspaceDndKitDraggableData';
import type { DropDestination } from '@/navigation/types/workspaceDndKitDropDestination';
import { isFolderDrag } from '@/navigation/utils/workspaceDndKitIsFolderDrag';
import { resolveDropTarget } from '@/navigation/utils/workspaceDndKitResolveDropTarget';
import { toDropResult } from '@/navigation/utils/workspaceDndKitToDropResult';

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

export type WorkspaceDndKitContextValues = {
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

export const useWorkspaceDndKit = (): {
  contextValues: WorkspaceDndKitContextValues;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragOver: (event: DragOverPayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
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

  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const { handleAddToNavigationDrop } = useHandleAddToNavigationDrop();
  const { handleWorkspaceNavigationMenuItemDragAndDrop } =
    useHandleWorkspaceNavigationMenuItemDragAndDrop();

  const orphanItemCount = workspaceNavigationMenuItems.filter(
    (item: { folderId?: string | null }) => !isDefined(item.folderId),
  ).length;

  const getNavItemById = useCallback(
    (id: string | undefined) =>
      id
        ? workspaceNavigationMenuItems.find((item) => item.id === id)
        : undefined,
    [workspaceNavigationMenuItems],
  );

  const applyWorkspaceReorderIfAllowed = (
    id: string,
    source: DropDestination,
    destination: DropDestination,
  ) => {
    const draggedItem = getNavItemById(id);
    const destFolderId = validateAndExtractWorkspaceFolderId(
      destination.droppableId,
    );
    if (
      isDefined(destFolderId) &&
      isDefined(draggedItem) &&
      isNavigationMenuItemFolder(draggedItem)
    ) {
      return;
    }
    const result = toDropResult(
      id,
      {
        sourceDroppableId: source.droppableId,
        sourceIndex: source.index,
      },
      destination,
    );
    const provided: ResponderProvided = { announce: () => {} };
    handleWorkspaceNavigationMenuItemDragAndDrop(
      { ...result, ...DROP_RESULT_OPTIONS },
      provided,
    );
  };

  const handleDragStart = (event: DragStartPayload) => {
    const { operation } = event;
    setIsDragging(true);
    const source = operation.source;
    const sourceId = source?.data?.sourceDroppableId ?? null;
    setSourceDroppableId(sourceId);

    if (sourceId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      const defaultDestination: DropDestination = {
        droppableId:
          NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
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
      const resolved = resolveDropTarget(target, getNavItemById);

      const getPayload = () =>
        store.get(addToNavPayloadRegistryState.atom).get(String(source?.id)) ??
        null;
      const getSourceItem = () =>
        getNavItemById(source?.id != null ? String(source.id) : undefined);

      if (
        resolved !== null &&
        source !== null &&
        target !== null &&
        isSortable(source) &&
        isSortable(target)
      ) {
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        if (isAddToNavDrag) {
          setForbiddenDropTargetId(null);
        } else {
          const destFolderId =
            'group' in target
              ? validateAndExtractWorkspaceFolderId(String(target.group))
              : validateAndExtractWorkspaceFolderId(
                  resolved.destination.droppableId,
                );
          const folderDrag = isFolderDrag(getPayload(), getSourceItem());
          const isFolderOverFolder = resolved.isTargetFolder && folderDrag;
          const isFolderOverFolderInList =
            !resolved.isTargetFolder && isDefined(destFolderId) && folderDrag;
          setForbiddenDropTargetId(
            isFolderOverFolder
              ? resolved.effectiveDropTargetId
              : isFolderOverFolderInList
                ? resolved.dropTargetId
                : null,
          );
        }
        return;
      }

      if (resolved !== null && sourceIsSortable) {
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        setAddToNavigationFallbackDestination(resolved.destination);
        if (!isAddToNavDrag) {
          const destFolderId = validateAndExtractWorkspaceFolderId(
            resolved.destination.droppableId,
          );
          const folderDrag = isFolderDrag(null, getSourceItem());
          setForbiddenDropTargetId(
            isDefined(destFolderId) && folderDrag
              ? resolved.effectiveDropTargetId
              : null,
          );
        } else {
          setForbiddenDropTargetId(null);
        }
        return;
      }

      if (!isAddToNavDrag) {
        return;
      }

      if (resolved !== null) {
        setAddToNavigationFallbackDestination(resolved.destination);
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        const folderId = validateAndExtractWorkspaceFolderId(
          resolved.destination.droppableId,
        );
        const folderDrag =
          getPayload()?.type === 'folder' && isDefined(folderId);
        setForbiddenDropTargetId(
          folderDrag ? resolved.effectiveDropTargetId : null,
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
      setActiveDropTargetId,
      setForbiddenDropTargetId,
      setAddToNavigationFallbackDestination,
      store,
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
    const sortableToSortable =
      sourceIsSortable &&
      targetIsSortable &&
      isDefined(source) &&
      isDefined(target);
    const resolved = resolveDropTarget(target, getNavItemById);

    if (sortableToSortable && resolved !== null) {
      const sourceDraggable = 'initialGroup' in source ? source : null;
      const initialGroup = sourceDraggable?.initialGroup ?? '';
      const initialIndex = sourceDraggable?.initialIndex ?? 0;
      const initialGroupStr = String(initialGroup);
      const destGroup = String(target.group ?? '');
      const bothWorkspace =
        isWorkspaceDroppableId(initialGroupStr) &&
        isWorkspaceDroppableId(destGroup);
      if (bothWorkspace) {
        applyWorkspaceReorderIfAllowed(
          draggableId,
          { droppableId: initialGroupStr, index: initialIndex },
          resolved.destination,
        );
        return;
      }
    }

    let destination: DropDestination | null = resolved?.destination ?? null;
    if (
      destination == null &&
      isDefined(fallback) &&
      isWorkspaceDroppableId(fallback.droppableId)
    ) {
      destination = fallback;
    }

    const result = toDropResult(draggableId, data, destination);
    const provided: ResponderProvided = { announce: () => {} };
    const dropResult = { ...result, ...DROP_RESULT_OPTIONS };

    if (sourceId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      handleAddToNavigationDrop(dropResult, provided);
      return;
    }

    if (
      isDefined(sourceId) &&
      isWorkspaceDroppableId(sourceId) &&
      isDefined(destination) &&
      isWorkspaceDroppableId(destination.droppableId)
    ) {
      applyWorkspaceReorderIfAllowed(
        draggableId,
        {
          droppableId: data?.sourceDroppableId ?? '',
          index: data?.sourceIndex ?? 0,
        },
        destination,
      );
    }
  };

  const contextValues: WorkspaceDndKitContextValues = {
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
