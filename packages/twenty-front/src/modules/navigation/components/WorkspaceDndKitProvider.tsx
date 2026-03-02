import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import type { ResponderProvided } from '@hello-pangea/dnd';
import { type ReactNode, useState } from 'react';

import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useHandleAddToNavigationDrop } from '@/navigation-menu-item/hooks/useHandleAddToNavigationDrop';
import { useHandleWorkspaceNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleWorkspaceNavigationMenuItemDragAndDrop';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/states/addToNavPayloadRegistryState';
import { getDndKitDropTargetId } from '@/navigation-menu-item/utils/getDndKitDropTargetId';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';
import { parseDropTargetIdToDestination } from '@/navigation-menu-item/utils/parseDropTargetIdToDestination';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { FavoritesDragContext } from '@/favorites/contexts/FavoritesDragContext';
import { WorkspaceDndKitContext } from '@/navigation/contexts/WorkspaceDndKitContext';

type WorkspaceDndKitProviderProps = {
  children: ReactNode;
};

type DraggableData = {
  sourceDroppableId?: string;
  sourceIndex?: number;
};

type DropDestination = { droppableId: string; index: number };

type SortableNode = Parameters<typeof isSortable>[0];

type DragOperationSource = {
  id: string;
  data?: DraggableData;
  group?: string;
  index?: number;
  initialGroup?: string;
  initialIndex?: number;
  sortable?: { element?: Element };
};

type DragOperationTarget = {
  id: string;
  group?: string;
  index?: number;
} | null;

type DragEventOperation = {
  source?: DragOperationSource;
  target?: DragOperationTarget;
};

type DragEventWithOperation = {
  operation?: DragEventOperation;
  preventDefault?: () => void;
};

const toDropResult = (
  draggableId: string,
  data: DraggableData | undefined,
  destination: DropDestination | null,
): {
  source: DropDestination;
  destination: DropDestination | null;
  draggableId: string;
} => {
  const sourceDroppableId = data?.sourceDroppableId ?? '';
  const sourceIndex = data?.sourceIndex ?? 0;
  return {
    source: { droppableId: sourceDroppableId, index: sourceIndex },
    destination,
    draggableId,
  };
};

const DROP_RESULT_OPTIONS = {
  reason: 'DROP' as const,
  combine: null,
  mode: 'FLUID' as const,
  type: 'DEFAULT' as const,
};

const WORKSPACE_DND_SENSORS = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
];

export const WorkspaceDndKitProvider = ({
  children,
}: WorkspaceDndKitProviderProps) => {
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
  ] = useState<{ droppableId: string; index: number } | null>(null);

  const store = useStore();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const { handleAddToNavigationDrop } = useHandleAddToNavigationDrop();
  const { handleWorkspaceNavigationMenuItemDragAndDrop } =
    useHandleWorkspaceNavigationMenuItemDragAndDrop();

  const orphanItemCount = workspaceNavigationMenuItems.filter(
    (item: { folderId?: string | null }) => !isDefined(item.folderId),
  ).length;

  const handleDragStart = (event: unknown) => {
    const e = event as DragEventWithOperation;
    setIsDragging(true);
    const source = e.operation?.source;
    const sourceId = source?.data?.sourceDroppableId ?? null;
    setSourceDroppableId(sourceId);

    if (sourceId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      const defaultDestination = {
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

  const handleDragOver = (event: unknown) => {
    const e = event as DragEventWithOperation;
    const source = e.operation?.source;
    const target = e.operation?.target;
    const isAddToNavDrag = sourceDroppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID;

    const sourceIsSortable = source && isSortable(source as SortableNode);
    const targetIsSortable = target && isSortable(target as SortableNode);

    if (
      isDefined(sourceIsSortable) &&
      isDefined(targetIsSortable) &&
      isDefined(source) &&
      isDefined(target)
    ) {
      const group = source.group ?? target.group;
      const index = source.group === target.group ? source.index : target.index;
      if (isDefined(group) && isDefined(index)) {
        if (isAddToNavDrag) {
          setActiveDropTargetId(getDndKitDropTargetId(group, index));
          setForbiddenDropTargetId(null);
        } else {
          setActiveDropTargetId(null);
          setForbiddenDropTargetId(null);
        }
        return;
      }
    }

    if (
      isDefined(sourceIsSortable) &&
      isDefined(target) &&
      typeof target.id === 'string'
    ) {
      const parsedDestination = parseDropTargetIdToDestination(target.id);
      if (
        isDefined(parsedDestination) &&
        isWorkspaceDroppableId(parsedDestination.droppableId)
      ) {
        if (isAddToNavDrag) {
          setActiveDropTargetId(target.id);
          setAddToNavigationFallbackDestination(parsedDestination);
          setForbiddenDropTargetId(null);
        } else {
          setActiveDropTargetId(null);
        }
        return;
      }
    }

    if (!isAddToNavDrag) {
      return;
    }

    if (
      isDefined(target) &&
      Boolean(targetIsSortable) &&
      isDefined(target.group) &&
      isDefined(target.index)
    ) {
      const destination = {
        droppableId: target.group,
        index: target.index,
      };
      setAddToNavigationFallbackDestination(destination);
      setActiveDropTargetId(getDndKitDropTargetId(target.group, target.index));
      const payload =
        store.get(addToNavPayloadRegistryState.atom).get(String(source?.id)) ??
        null;
      const folderId = validateAndExtractWorkspaceFolderId(
        destination.droppableId,
      );
      const isFolderOverFolder =
        payload?.type === 'folder' && isDefined(folderId);
      setForbiddenDropTargetId(
        isFolderOverFolder
          ? getDndKitDropTargetId(target.group, target.index)
          : null,
      );
      return;
    }

    const overId = target?.id;
    const parsedDestination =
      typeof overId === 'string'
        ? parseDropTargetIdToDestination(overId)
        : null;
    if (
      typeof overId !== 'string' ||
      !parsedDestination ||
      !isWorkspaceDroppableId(parsedDestination.droppableId)
    ) {
      const fallback = addToNavigationFallbackDestination;
      setActiveDropTargetId(
        fallback
          ? getDndKitDropTargetId(fallback.droppableId, fallback.index)
          : null,
      );
      setForbiddenDropTargetId(null);
      return;
    }
    setAddToNavigationFallbackDestination(parsedDestination);
    setActiveDropTargetId(overId);
    const payload =
      store
        .get(addToNavPayloadRegistryState.atom)
        .get(String(e.operation?.source?.id)) ?? null;
    const folderId = validateAndExtractWorkspaceFolderId(
      parsedDestination.droppableId,
    );
    const isFolderOverFolder =
      payload?.type === 'folder' && isDefined(folderId);
    setForbiddenDropTargetId(isFolderOverFolder ? overId : null);
  };

  const handleDragEnd = (event: unknown) => {
    const e = event as DragEventWithOperation;
    const source = e.operation?.source;
    const target = e.operation?.target;
    const draggableId = String(source?.id);
    const data = source?.data;
    const sourceId = data?.sourceDroppableId ?? null;
    const fallback = addToNavigationFallbackDestination;

    setIsDragging(false);
    setSourceDroppableId(null);
    setActiveDropTargetId(null);
    setForbiddenDropTargetId(null);
    setAddToNavigationFallbackDestination(null);

    const sourceIsSortable =
      isDefined(source) && isSortable(source as SortableNode);
    const targetIsSortable =
      isDefined(target) && isSortable(target as SortableNode);

    if (sourceIsSortable) {
      const initialGroup = source.initialGroup ?? '';
      const initialIndex = source.initialIndex ?? 0;
      const destGroup = target?.group ?? '';
      const destIndex = target?.index ?? 0;
      if (
        targetIsSortable &&
        isWorkspaceDroppableId(initialGroup) &&
        isWorkspaceDroppableId(destGroup)
      ) {
        const isCrossGroup = initialGroup !== destGroup;
        if (isCrossGroup) {
          const sourceElement = source.sortable?.element;
          const sourceContainer =
            typeof document !== 'undefined'
              ? document.querySelector(`[data-dnd-group="${initialGroup}"]`)
              : null;
          if (isDefined(sourceElement) && isDefined(sourceContainer)) {
            const child = sourceContainer.children[initialIndex] ?? null;
            sourceContainer.insertBefore(sourceElement, child);
          }
        }
        const result = toDropResult(
          draggableId,
          { sourceDroppableId: initialGroup, sourceIndex: initialIndex },
          { droppableId: destGroup, index: destIndex },
        );
        const provided: ResponderProvided = { announce: () => {} };
        handleWorkspaceNavigationMenuItemDragAndDrop(
          { ...result, ...DROP_RESULT_OPTIONS },
          provided,
        );
        return;
      }
    }

    const overId = target?.id;
    let destination: DropDestination | null = null;
    if (
      isDefined(target) &&
      targetIsSortable &&
      isDefined(target.group) &&
      isDefined(target.index)
    ) {
      destination = { droppableId: target.group, index: target.index };
    } else if (typeof overId === 'string') {
      destination = parseDropTargetIdToDestination(overId);
    } else if (
      sourceId === ADD_TO_NAV_SOURCE_DROPPABLE_ID &&
      isDefined(fallback)
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
      handleWorkspaceNavigationMenuItemDragAndDrop(dropResult, provided);
    }
  };

  return (
    <WorkspaceDndKitContext.Provider value={true}>
      <NavigationDragSourceContext.Provider value={{ sourceDroppableId }}>
        <NavigationMenuItemDragContext.Provider value={{ isDragging }}>
          <FavoritesDragContext.Provider value={{ isDragging }}>
            <NavigationDropTargetContext.Provider
              value={{
                activeDropTargetId,
                setActiveDropTargetId,
                forbiddenDropTargetId,
                setForbiddenDropTargetId,
                addToNavigationFallbackDestination,
              }}
            >
              <DragDropProvider
                sensors={WORKSPACE_DND_SENSORS}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                {children}
              </DragDropProvider>
            </NavigationDropTargetContext.Provider>
          </FavoritesDragContext.Provider>
        </NavigationMenuItemDragContext.Provider>
      </NavigationDragSourceContext.Provider>
    </WorkspaceDndKitContext.Provider>
  );
};
