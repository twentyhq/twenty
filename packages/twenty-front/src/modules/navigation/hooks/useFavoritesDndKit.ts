import { type DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import type { ResponderProvided } from '@hello-pangea/dnd';
import { type ComponentProps, useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/common/constants/AddToNavSourceDroppableId';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { useHandleAddToNavigationDrop } from '@/navigation-menu-item/display/dnd/hooks/useHandleAddToNavigationDrop';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/display/dnd/hooks/useHandleNavigationMenuItemDragAndDrop';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';

import { DROP_RESULT_OPTIONS } from '@/navigation/constants/workspaceDndKitDropResultOptions';
import type { DraggableData } from '@/navigation/types/workspaceDndKitDraggableData';
import type { DropDestination } from '@/navigation/types/workspaceDndKitDropDestination';
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

export type FavoritesDndKitContextValues = {
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

const resolveFavoritesDropTarget = (
  target: {
    id?: unknown;
    group?: unknown;
    index?: unknown;
    data?: unknown;
  } | null,
  getNavItemById: (id: string | undefined) => NavigationMenuItem | undefined,
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

    const destination: DropDestination = isTargetFolder
      ? { droppableId: `folder-header-${target.id}`, index: 0 }
      : { droppableId: group, index };

    const effectiveDropTargetId = isTargetFolder
      ? getDndKitDropTargetId(`folder-header-${target.id}`, 0)
      : getDndKitDropTargetId(group, index);

    return { destination, effectiveDropTargetId, isTargetFolder };
  }

  return null;
};

export const useFavoritesDndKit = (): {
  contextValues: FavoritesDndKitContextValues;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragOver: (event: DragOverPayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
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
  const { handleAddToNavigationDrop } = useHandleAddToNavigationDrop();
  const { handleNavigationMenuItemDragAndDrop } =
    useHandleNavigationMenuItemDragAndDrop();

  const orphanItemCount = navigationMenuItemsSorted.filter(
    (item: { folderId?: string | null }) => !isDefined(item.folderId),
  ).length;

  const getNavItemById = useCallback(
    (id: string | undefined) =>
      id ? navigationMenuItems.find((item) => item.id === id) : undefined,
    [navigationMenuItems],
  );

  const handleDragStart = (event: DragStartPayload) => {
    const { operation } = event;
    setIsDragging(true);
    const source = operation.source;
    const sourceId = source?.data?.sourceDroppableId ?? null;
    setSourceDroppableId(sourceId);

    if (sourceId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      const defaultDestination: DropDestination = {
        droppableId:
          NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS,
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
      const resolved = resolveFavoritesDropTarget(target, getNavItemById);

      if (
        resolved !== null &&
        source !== null &&
        target !== null &&
        isSortable(source) &&
        isSortable(target)
      ) {
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        setForbiddenDropTargetId(null);
        return;
      }

      if (resolved !== null && source !== null && isSortable(source)) {
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        setAddToNavigationFallbackDestination(resolved.destination);
        setForbiddenDropTargetId(null);
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
      setActiveDropTargetId,
      setForbiddenDropTargetId,
      setAddToNavigationFallbackDestination,
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

    const resolved = resolveFavoritesDropTarget(target, getNavItemById);
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

  const contextValues: FavoritesDndKitContextValues = {
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
