import { isSortable } from '@dnd-kit/react/sortable';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import type { DraggableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDraggableData';
import type { DropDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDropDestination';
import type { NavigationMenuItemDropResult } from '@/navigation-menu-item/common/types/navigationMenuItemDropResult';
import type { SortableTargetDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitSortableTargetDestination';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { extractFolderIdFromDroppableId } from '@/navigation-menu-item/common/utils/extractFolderIdFromDroppableId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
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
  const [
  ] = useState<DropDestination | null>(null);

  const { navigationMenuItems } = useNavigationMenuItemsData();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const { handleNavigationMenuItemDragAndDrop } =
    useHandleNavigationMenuItemDragAndDrop(sectionType);

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

      const destFolderId = extractFolderIdFromDroppableId(
        resolved.destination.droppableId,
        sectionType,
      );
      if (isDefined(destFolderId)) {
        return resolved.dropTargetId;
      }

      return null;
    },
    [sectionType, isSourceFolderDrag],
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
  };

  const handleDragOver = useCallback(
    (event: DragOverPayload) => {
      const { operation } = event;
      const source = operation.source;
      const target = operation.target;
      const sourceIsSortable = source !== null && isSortable(source);
      const resolved = resolveDropTarget(target, getNavItemById, sectionType);

      if (
        resolved !== null &&
        source !== null &&
        target !== null &&
        isSortable(source) &&
        isSortable(target)
      ) {
        setActiveDropTargetId(resolved.dropTargetId);
        setForbiddenDropTargetId(computeForbiddenTargetId(source, resolved));
        return;
      }

      if (resolved !== null && sourceIsSortable) {
        setActiveDropTargetId(resolved.effectiveDropTargetId);
        setForbiddenDropTargetId(computeForbiddenTargetId(source, resolved));
      }
    },
    [getNavItemById, sectionType, computeForbiddenTargetId],
  );

  const handleDragEnd = (event: DragEndPayload) => {
    const { operation } = event;
    const source = operation.source;
    const target = operation.target;
    const draggableId = String(source?.id);
    const data = source?.data;
    const sourceId = data?.sourceDroppableId ?? null;

    setIsDragging(false);
    setSourceDroppableId(null);
    setActiveDropTargetId(null);
    setForbiddenDropTargetId(null);

    const sourceIsSortable = source !== null && isSortable(source);
    const targetIsSortable = target !== null && isSortable(target);
    const resolved = resolveDropTarget(target, getNavItemById, sectionType);

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

    const destination: DropDestination | null = resolved?.destination ?? null;
    const insertBeforeItemId = resolved?.insertBeforeItemId;

    const dropResult: NavigationMenuItemDropResult = {
      draggableId,
      source: {
        droppableId: data?.sourceDroppableId ?? '',
        index: data?.sourceIndex ?? 0,
      },
      destination,
      ...(insertBeforeItemId != null && { insertBeforeItemId }),
    };

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
