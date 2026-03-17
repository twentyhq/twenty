import { type DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import type { ResponderProvided } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { type ComponentProps, useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/common/constants/AddToNavSourceDroppableId';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/common/states/addToNavPayloadRegistryState';
import type { DraggableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDraggableData';
import type { DroppableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDroppableData';
import type { DropDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDropDestination';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { isFavoritesDroppableId } from '@/navigation-menu-item/common/utils/isFavoritesDroppableId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/common/utils/isWorkspaceDroppableId';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/common/utils/validateAndExtractWorkspaceFolderId';
import { DROP_RESULT_OPTIONS } from '@/navigation-menu-item/display/dnd/constants/navigationMenuItemDndKitDropResultOptions';
import { useHandleAddToNavigationDrop } from '@/navigation-menu-item/display/dnd/hooks/useHandleAddToNavigationDrop';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/display/dnd/hooks/useHandleNavigationMenuItemDragAndDrop';
import { useHandleWorkspaceNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/display/dnd/hooks/useHandleWorkspaceNavigationMenuItemDragAndDrop';
import { isFolderDrag } from '@/navigation-menu-item/display/dnd/utils/navigationMenuItemDndKitIsFolderDrag';
import { resolveDropTarget } from '@/navigation-menu-item/display/dnd/utils/navigationMenuItemDndKitResolveDropTarget';
import { toDropResult } from '@/navigation-menu-item/display/dnd/utils/navigationMenuItemDndKitToDropResult';
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

const isDroppableDataShape = (data: unknown): data is DroppableData =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as DroppableData).droppableId === 'string' &&
  typeof (data as DroppableData).index === 'number';

const resolveFavoritesDropTarget = (
  target: {
    id?: unknown;
    group?: unknown;
    index?: unknown;
    data?: unknown;
  } | null,
  getNavItemById: (id: string | undefined) => NavigationMenuItem | undefined,
  sourceIsFolder = false,
): {
  destination: DropDestination;
  effectiveDropTargetId: string;
  isTargetFolder: boolean;
} | null => {
  if (target === null || target === undefined) {
    return null;
  }

  if (isDefined(target.group) && isDefined(target.index)) {
    const group = String(target.group);
    const index = Number(target.index);
    if (!Number.isInteger(index) || index < 0) {
      return null;
    }

    const targetItem = getNavItemById(
      target.id != null ? String(target.id) : undefined,
    );
    const isTargetFolder =
      isDefined(targetItem) && isNavigationMenuItemFolder(targetItem);

    const shouldDropIntoFolder = isTargetFolder && !sourceIsFolder;

    const destination: DropDestination = shouldDropIntoFolder
      ? { droppableId: `folder-header-${target.id}`, index: 0 }
      : { droppableId: group, index };

    const effectiveDropTargetId = shouldDropIntoFolder
      ? getDndKitDropTargetId(`folder-header-${target.id}`, 0)
      : getDndKitDropTargetId(group, index);

    return { destination, effectiveDropTargetId, isTargetFolder };
  }

  if (isDroppableDataShape(target.data)) {
    const { droppableId, index } = target.data;
    if (isFavoritesDroppableId(droppableId)) {
      return {
        destination: { droppableId, index },
        effectiveDropTargetId: String(target.id),
        isTargetFolder: false,
      };
    }
  }

  return null;
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
  const isFavoritesSection = section === NavigationSections.FAVORITES;
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
    useHandleNavigationMenuItemDragAndDrop();
  const { handleWorkspaceNavigationMenuItemDragAndDrop } =
    useHandleWorkspaceNavigationMenuItemDragAndDrop();

  const items = isFavoritesSection
    ? navigationMenuItems
    : workspaceNavigationMenuItems;

  const orphanItems = isFavoritesSection
    ? navigationMenuItemsSorted
    : workspaceNavigationMenuItems;

  const orphanItemCount = orphanItems.filter(
    (item: { folderId?: string | null }) => !isDefined(item.folderId),
  ).length;

  const defaultOrphanDroppableId = isFavoritesSection
    ? NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS
    : NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS;

  const getNavItemById = useCallback(
    (id: string | undefined) =>
      id ? items.find((item) => item.id === id) : undefined,
    [items],
  );

  const applyWorkspaceReorderIfAllowed = useCallback(
    (
      id: string,
      source: DropDestination,
      destination: DropDestination,
      insertBeforeItemId?: string | null,
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
        {
          ...result,
          ...DROP_RESULT_OPTIONS,
          ...(insertBeforeItemId != null && { insertBeforeItemId }),
        },
        provided,
      );
    },
    [getNavItemById, handleWorkspaceNavigationMenuItemDragAndDrop],
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

  const computeFavoritesForbiddenTarget = useCallback(
    (
      source: { id?: unknown; data?: unknown } | null,
      resolved: {
        destination: DropDestination;
        effectiveDropTargetId: string;
        isTargetFolder: boolean;
      },
    ): string | null => {
      const sourceItem = getNavItemById(
        source?.id != null ? String(source.id) : undefined,
      );
      const sourceIsFolder =
        isDefined(sourceItem) && isNavigationMenuItemFolder(sourceItem);
      const isFolderOverFolder = resolved.isTargetFolder && sourceIsFolder;
      const destIsFolderContent =
        resolved.destination.droppableId.startsWith('folder-') &&
        !resolved.destination.droppableId.startsWith('folder-header-');
      const isFolderOverFolderContent = destIsFolderContent && sourceIsFolder;
      if (isFolderOverFolder || isFolderOverFolderContent) {
        return resolved.effectiveDropTargetId;
      }
      return null;
    },
    [getNavItemById],
  );

  const handleFavoritesDragOver = useCallback(
    (event: DragOverPayload) => {
      const { operation } = event;
      const source = operation.source;
      const target = operation.target;
      const isAddToNavDrag =
        sourceDroppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID;
      const sourceItem = getNavItemById(
        source?.id != null ? String(source.id) : undefined,
      );
      const sourceIsFolder =
        isDefined(sourceItem) && isNavigationMenuItemFolder(sourceItem);
      const resolved = resolveFavoritesDropTarget(
        target,
        getNavItemById,
        sourceIsFolder,
      );

      if (
        resolved !== null &&
        source !== null &&
        target !== null &&
        isSortable(source) &&
        isSortable(target)
      ) {
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        setForbiddenDropTargetId(
          computeFavoritesForbiddenTarget(source, resolved),
        );
        return;
      }

      if (resolved !== null && source !== null && isSortable(source)) {
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        setAddToNavigationFallbackDestination(resolved.destination);
        setForbiddenDropTargetId(
          computeFavoritesForbiddenTarget(source, resolved),
        );
        return;
      }

      if (!isAddToNavDrag) {
        return;
      }

      if (resolved !== null) {
        setAddToNavigationFallbackDestination(resolved.destination);
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        setForbiddenDropTargetId(null);
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
      computeFavoritesForbiddenTarget,
    ],
  );

  const handleWorkspaceDragOver = useCallback(
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
          const folderDragResult = isFolderDrag(getPayload(), getSourceItem());
          const isFolderOverFolder =
            resolved.isTargetFolder && folderDragResult;
          const isFolderOverFolderInList =
            !resolved.isTargetFolder &&
            isDefined(destFolderId) &&
            folderDragResult;
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
          const folderDragResult = isFolderDrag(null, getSourceItem());
          setForbiddenDropTargetId(
            isDefined(destFolderId) && folderDragResult
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
        const folderDragResult =
          getPayload()?.type === 'FOLDER' && isDefined(folderId);
        setForbiddenDropTargetId(
          folderDragResult ? resolved.effectiveDropTargetId : null,
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
      store,
    ],
  );

  const handleDragOver = isFavoritesSection
    ? handleFavoritesDragOver
    : handleWorkspaceDragOver;

  const handleFavoritesDragEnd = (event: DragEndPayload) => {
    const { operation } = event;
    const source = operation.source;
    const target = operation.target;
    const draggableId = String(source?.id);
    const data = source?.data;
    const sourceId = data?.sourceDroppableId ?? null;
    const fallback = addToNavigationFallbackDestination;

    const sourceItem = getNavItemById(
      source?.id != null ? String(source.id) : undefined,
    );
    const sourceIsFolder =
      isDefined(sourceItem) && isNavigationMenuItemFolder(sourceItem);

    setIsDragging(false);
    setSourceDroppableId(null);
    setActiveDropTargetId(null);
    setForbiddenDropTargetId(null);
    setAddToNavigationFallbackDestination(null);

    const resolved = resolveFavoritesDropTarget(
      target,
      getNavItemById,
      sourceIsFolder,
    );
    let destination: DropDestination | null = resolved?.destination ?? null;

    if (destination == null && isDefined(fallback)) {
      destination = fallback;
    }

    const result = toDropResult(draggableId, data, destination);
    const dropResult = { ...result, ...DROP_RESULT_OPTIONS };
    const provided: ResponderProvided = { announce: () => {} };

    if (sourceId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      handleAddToNavigationDrop(dropResult, provided);
      return;
    }

    handleNavigationMenuItemDragAndDrop(dropResult, provided);
  };

  const handleWorkspaceDragEnd = (event: DragEndPayload) => {
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
        const insertBeforeItemId = resolved.isTargetFolder
          ? null
          : String(target?.id ?? '');
        applyWorkspaceReorderIfAllowed(
          draggableId,
          { droppableId: initialGroupStr, index: initialIndex },
          resolved.destination,
          insertBeforeItemId || undefined,
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

  const handleDragEnd = isFavoritesSection
    ? handleFavoritesDragEnd
    : handleWorkspaceDragEnd;

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
