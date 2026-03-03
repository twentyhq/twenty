import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import type { ResponderProvided } from '@hello-pangea/dnd';
import { type ComponentProps, type ReactNode, useState } from 'react';

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

import { WorkspaceDndKitContext } from '@/navigation/contexts/WorkspaceDndKitContext';

type WorkspaceDndKitProviderProps = {
  children: ReactNode;
};

type DraggableData = {
  sourceDroppableId?: string;
  sourceIndex?: number;
};

type DropDestination = { droppableId: string; index: number };

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

  const handleDragStart = (event: DragStartPayload) => {
    const { operation } = event;
    setIsDragging(true);
    const source = operation.source;
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

  const handleDragOver = (event: DragOverPayload) => {
    const { operation } = event;
    const source = operation.source;
    const target = operation.target;
    const isAddToNavDrag = sourceDroppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID;

    const sourceIsSortable = source !== null && isSortable(source);

    if (
      source !== null &&
      target !== null &&
      isSortable(source) &&
      isSortable(target) &&
      isDefined(target.group) &&
      isDefined(target.index)
    ) {
      const dropTargetId = getDndKitDropTargetId(
        String(target.group),
        target.index,
      );
      setActiveDropTargetId(dropTargetId);
      if (isAddToNavDrag) {
        setForbiddenDropTargetId(null);
      } else {
        const destDroppableId = String(target.group);
        const folderId = validateAndExtractWorkspaceFolderId(destDroppableId);
        const payload =
          store
            .get(addToNavPayloadRegistryState.atom)
            .get(String(source?.id)) ?? null;
        const isFolderOverFolder =
          payload?.type === 'folder' && isDefined(folderId);
        setForbiddenDropTargetId(isFolderOverFolder ? dropTargetId : null);
      }
      return;
    }

    const targetIdIsString =
      isDefined(sourceIsSortable) &&
      isDefined(target) &&
      typeof target.id === 'string';
    if (targetIdIsString && target !== null) {
      const parsedDestination = parseDropTargetIdToDestination(
        String(target.id),
      );
      const validParsed =
        isDefined(parsedDestination) &&
        isWorkspaceDroppableId(parsedDestination.droppableId);
      if (validParsed && isAddToNavDrag) {
        setActiveDropTargetId(String(target.id));
        setAddToNavigationFallbackDestination(parsedDestination);
        setForbiddenDropTargetId(null);
        return;
      }
      if (validParsed && !isAddToNavDrag) {
        setActiveDropTargetId(String(target.id));
        return;
      }
    }

    if (!isAddToNavDrag) {
      return;
    }

    if (
      target !== null &&
      isSortable(target) &&
      isDefined(target.group) &&
      isDefined(target.index)
    ) {
      const destDroppableId = String(target.group);
      const destination = {
        droppableId: destDroppableId,
        index: target.index,
      };
      setAddToNavigationFallbackDestination(destination);
      setActiveDropTargetId(
        getDndKitDropTargetId(destDroppableId, target.index),
      );
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
          ? getDndKitDropTargetId(destDroppableId, target.index)
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
    setActiveDropTargetId(typeof overId === 'string' ? overId : String(overId));
    const payload =
      store
        .get(addToNavPayloadRegistryState.atom)
        .get(String(operation.source?.id)) ?? null;
    const folderId = validateAndExtractWorkspaceFolderId(
      parsedDestination.droppableId,
    );
    const isFolderOverFolder =
      payload?.type === 'folder' && isDefined(folderId);
    setForbiddenDropTargetId(
      isFolderOverFolder && overId != null
        ? typeof overId === 'string'
          ? overId
          : String(overId)
        : null,
    );
  };

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
    if (sortableToSortable) {
      const sourceDraggable = 'initialGroup' in source ? source : null;
      const initialGroup = sourceDraggable?.initialGroup ?? '';
      const initialIndex = sourceDraggable?.initialIndex ?? 0;
      const destGroup = String(target.group ?? '');
      const destIndex = target.index ?? 0;
      const initialGroupStr = String(initialGroup);
      const bothWorkspace =
        isWorkspaceDroppableId(initialGroupStr) &&
        isWorkspaceDroppableId(destGroup);
      if (bothWorkspace) {
        const result = toDropResult(
          draggableId,
          { sourceDroppableId: initialGroupStr, sourceIndex: initialIndex },
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
      target !== null &&
      isSortable(target) &&
      isDefined(target.group) &&
      isDefined(target.index)
    ) {
      destination = {
        droppableId: String(target.group),
        index: target.index,
      };
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
          <NavigationDropTargetContext.Provider
            value={{
              activeDropTargetId,
              setActiveDropTargetId,
              forbiddenDropTargetId,
              setForbiddenDropTargetId,
              addToNavigationFallbackDestination,
            }}
          >
            <DragDropProvider<DraggableData>
              sensors={WORKSPACE_DND_SENSORS}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {children}
            </DragDropProvider>
          </NavigationDropTargetContext.Provider>
        </NavigationMenuItemDragContext.Provider>
      </NavigationDragSourceContext.Provider>
    </WorkspaceDndKitContext.Provider>
  );
};
