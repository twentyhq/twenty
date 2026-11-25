import { isSortable } from '@dnd-kit/react/sortable';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections';
import type { DraggableData } from '@/navigation-menu-item/common/types/NavigationMenuItemDndKitDraggableData';
import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/NavigationMenuItemDropResult';
import type { SortableTargetDestination } from '@/navigation-menu-item/common/types/NavigationMenuItemDndKitSortableTargetDestination';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { resolveNavigationMenuItemDroppableId } from '@/navigation-menu-item/common/utils/resolveNavigationMenuItemDroppableId';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/display/dnd/hooks/useHandleNavigationMenuItemDragAndDrop';
import { resolveDropTarget } from '@/navigation-menu-item/display/dnd/utils/navigationMenuItemDndKitResolveDropTarget';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemsDraftState';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragOverEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragOverEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';

type DragStartPayload = DragDropProviderDragStartEvent<DraggableData>;
type DragOverPayload = DragDropProviderDragOverEvent<DraggableData>;
type DragEndPayload = DragDropProviderDragEndEvent<DraggableData>;

export type NavigationMenuItemDndKitContextValues = {
  dragSource: { sourceDroppableId: string | null };
  drag: { isDragging: boolean };
  dropTarget: {
    activeDropTargetId: string | null;
    setActiveDropTargetId: (id: string | null) => void;
    forbiddenDropTargetId: string | null;
    setForbiddenDropTargetId: (id: string | null) => void;
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

  const { navigationMenuItems } = useNavigationMenuItemsData();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const {
    handleNavigationMenuItemDragAndDrop,
    isNavigationMenuItemDropAllowed,
  } = useHandleNavigationMenuItemDragAndDrop(sectionType);

  const items = isWorkspaceSection
    ? workspaceNavigationMenuItems
    : navigationMenuItems;

  const getNavItemById = useCallback(
    (id: string | undefined) =>
      id ? items.find((item) => item.id === id) : undefined,
    [items],
  );

  const isSourceFolderDrag = useCallback(
    (source: { id?: unknown; data?: unknown } | null): boolean => {
      const sourceItem = getNavItemById(
        source?.id != null ? String(source.id) : undefined,
      );
      return isDefined(sourceItem) && isNavigationMenuItemFolder(sourceItem);
    },
    [getNavItemById],
  );

  const computeForbiddenTargetId = useCallback(
    (
      source: { id?: unknown; data?: unknown } | null,
      resolved: SortableTargetDestination,
    ): string | null => {
      if (!isSourceFolderDrag(source)) {
        return null;
      }

      if (resolved.isTargetFolder) {
        return resolved.effectiveDropTargetId;
      }

      const destinationKind = resolveNavigationMenuItemDroppableId({
        droppableId: resolved.destination.droppableId,
        navigationMenuItemSection: sectionType,
        getNavigationMenuItemById: getNavItemById,
      })?.kind;
      if (destinationKind === 'folder' || destinationKind === 'folderHeader') {
        return resolved.dropTargetId;
      }

      return null;
    },
    [sectionType, isSourceFolderDrag, getNavItemById],
  );

  const isWorkspaceDroppable = (droppableId: string) =>
    canNavigationMenuItemBeDroppedIn({
      navigationMenuItemSection: 'workspace',
      droppableId,
    });

  const buildDropResult = ({
    source,
    target,
    resolved,
  }: {
    source:
      | DragOverPayload['operation']['source']
      | DragEndPayload['operation']['source'];
    target:
      | DragOverPayload['operation']['target']
      | DragEndPayload['operation']['target'];
    resolved: SortableTargetDestination | null;
  }): NavigationMenuItemDropResult | null => {
    const draggableId = String(source?.id);

    if (
      isWorkspaceSection &&
      isDefined(source) &&
      isSortable(source) &&
      isDefined(target) &&
      isSortable(target) &&
      isDefined(resolved)
    ) {
      const sourceDraggable = 'initialGroup' in source ? source : null;
      const initialGroup = sourceDraggable?.initialGroup;
      const initialIndex = sourceDraggable?.initialIndex;

      if (
        isDefined(initialGroup) &&
        isDefined(initialIndex) &&
        isDefined(target.group) &&
        isWorkspaceDroppable(String(initialGroup)) &&
        isWorkspaceDroppable(String(target.group))
      ) {
        return {
          draggableId,
          source: {
            droppableId: String(initialGroup),
            index: initialIndex,
          },
          destination: resolved.destination,
          ...(isDefined(target.id) && {
            insertBeforeItemId: String(target.id),
          }),
        };
      }
    }

    const sourceDroppableId = source?.data?.sourceDroppableId;
    const sourceIndex = source?.data?.sourceIndex;

    if (!isDefined(sourceDroppableId) || !isDefined(sourceIndex)) {
      return null;
    }

    const insertBeforeItemId = resolved?.insertBeforeItemId;

    return {
      draggableId,
      source: {
        droppableId: sourceDroppableId,
        index: sourceIndex,
      },
      destination: resolved?.destination ?? null,
      ...(isDefined(insertBeforeItemId) && { insertBeforeItemId }),
    };
  };

  const isDropResultAccepted = (result: NavigationMenuItemDropResult) =>
    !isWorkspaceSection ||
    (isWorkspaceDroppable(result.source.droppableId) &&
      isDefined(result.destination) &&
      isWorkspaceDroppable(result.destination.droppableId));

  const handleDragStart = (event: DragStartPayload) => {
    const { operation } = event;
    setIsDragging(true);
    const source = operation.source;
    const sourceId = source?.data?.sourceDroppableId ?? null;
    setSourceDroppableId(sourceId);
  };

  const handleDragOver = (event: DragOverPayload) => {
    const { source, target } = event.operation;
    const resolved = resolveDropTarget(target, getNavItemById, sectionType);

    if (!isDefined(resolved) || !isDefined(source) || !isSortable(source)) {
      return;
    }

    const dropTargetId =
      isDefined(target) && isSortable(target)
        ? resolved.dropTargetId
        : resolved.effectiveDropTargetId;
    const dropResult = buildDropResult({ source, target, resolved });
    const isDropAllowed =
      isDefined(dropResult) &&
      isDropResultAccepted(dropResult) &&
      isNavigationMenuItemDropAllowed(dropResult);

    setActiveDropTargetId(dropTargetId);
    setForbiddenDropTargetId(
      computeForbiddenTargetId(source, resolved) ??
        (isDropAllowed ? null : dropTargetId),
    );
  };

  const handleDragEnd = (event: DragEndPayload) => {
    const { source, target } = event.operation;

    setIsDragging(false);
    setSourceDroppableId(null);
    setActiveDropTargetId(null);
    setForbiddenDropTargetId(null);

    const dropResult = buildDropResult({
      source,
      target,
      resolved: resolveDropTarget(target, getNavItemById, sectionType),
    });

    if (!isDefined(dropResult) || !isDropResultAccepted(dropResult)) {
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
