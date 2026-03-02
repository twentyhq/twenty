import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
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

const toDropResult = (
  draggableId: string,
  data: DraggableData | undefined,
  destination: { droppableId: string; index: number } | null,
): {
  source: { droppableId: string; index: number };
  destination: { droppableId: string; index: number } | null;
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

  const sensors = [
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({ value: 8 }),
      ],
    }),
    KeyboardSensor,
  ];

  const handleDragStart = (event: unknown) => {
    const e = event as {
      operation?: { source?: { id: string; data?: DraggableData } };
    };
    setIsDragging(true);
    const source = e.operation?.source;
    const sourceId =
      (source?.data as DraggableData | undefined)?.sourceDroppableId ?? null;
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
    const e = event as {
      preventDefault?: () => void;
      operation?: {
        source?: {
          id: string;
          group?: string;
          index?: number;
          initialGroup?: string;
          initialIndex?: number;
        };
        target?: {
          id: string;
          group?: string;
          index?: number;
        } | null;
      };
    };
    const source = e.operation?.source;
    const target = e.operation?.target;
    const isAddToNavDrag = sourceDroppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID;

    const sourceIsSortable =
      source && isSortable(source as Parameters<typeof isSortable>[0]);
    const targetIsSortable =
      target && isSortable(target as Parameters<typeof isSortable>[0]);

    if (isDefined(sourceIsSortable) && isDefined(targetIsSortable)) {
      const s = source as { group?: string; index?: number };
      const t = target as { group?: string; index?: number };
      const group = s.group ?? t.group;
      const index = s.group === t.group ? s.index : t.index;
      if (group != null && index != null) {
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
      const dest = parseDropTargetIdToDestination(target.id);
      if (isDefined(dest) && isWorkspaceDroppableId(dest.droppableId)) {
        if (isAddToNavDrag) {
          setActiveDropTargetId(target.id);
          setAddToNavigationFallbackDestination(dest);
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
      isSortable(target as Parameters<typeof isSortable>[0]) &&
      isDefined(target.group) &&
      isDefined(target.index)
    ) {
      const t = target as { group: string; index: number };
      const destination = {
        droppableId: t.group,
        index: t.index,
      };
      setAddToNavigationFallbackDestination(destination);
      setActiveDropTargetId(getDndKitDropTargetId(t.group, t.index));
      const payload =
        store.get(addToNavPayloadRegistryState.atom).get(String(source?.id)) ??
        null;
      const folderId = validateAndExtractWorkspaceFolderId(
        destination.droppableId,
      );
      const isFolderOverFolder =
        payload?.type === 'folder' && folderId !== null;
      setForbiddenDropTargetId(
        isFolderOverFolder ? getDndKitDropTargetId(t.group, t.index) : null,
      );
      return;
    }

    const overId = target?.id;
    if (typeof overId !== 'string') {
      const fallback = addToNavigationFallbackDestination;
      setActiveDropTargetId(
        fallback
          ? getDndKitDropTargetId(fallback.droppableId, fallback.index)
          : null,
      );
      setForbiddenDropTargetId(null);
      return;
    }
    const dest = parseDropTargetIdToDestination(overId);
    if (!dest || !isWorkspaceDroppableId(dest.droppableId)) {
      const fallback = addToNavigationFallbackDestination;
      setActiveDropTargetId(
        fallback
          ? getDndKitDropTargetId(fallback.droppableId, fallback.index)
          : null,
      );
      setForbiddenDropTargetId(null);
      return;
    }
    setAddToNavigationFallbackDestination(dest);
    setActiveDropTargetId(overId);

    const payload =
      store
        .get(addToNavPayloadRegistryState.atom)
        .get(String(e.operation?.source?.id)) ?? null;
    const folderId = validateAndExtractWorkspaceFolderId(dest.droppableId);
    const isFolderOverFolder = payload?.type === 'folder' && folderId !== null;
    setForbiddenDropTargetId(isFolderOverFolder ? overId : null);
  };

  const handleDragEnd = (event: unknown) => {
    const e = event as {
      operation?: {
        source?: {
          id: string;
          data?: DraggableData;
          group?: string;
          index?: number;
          initialGroup?: string;
          initialIndex?: number;
        };
        target?: { id: string; group?: string; index?: number } | null;
      };
    };
    const source = e.operation?.source;
    const target = e.operation?.target;
    const draggableId = String(source?.id);
    const data = source?.data as DraggableData | undefined;
    const sourceId = data?.sourceDroppableId ?? null;
    const fallback = addToNavigationFallbackDestination;

    setIsDragging(false);
    setSourceDroppableId(null);
    setActiveDropTargetId(null);
    setForbiddenDropTargetId(null);
    setAddToNavigationFallbackDestination(null);

    if (
      isDefined(source) &&
      isSortable(source as Parameters<typeof isSortable>[0])
    ) {
      const targetAsSortable =
        target && isSortable(target as Parameters<typeof isSortable>[0]);
      const initialGroup =
        (source as { initialGroup?: string }).initialGroup ?? '';
      const initialIndex =
        (source as { initialIndex?: number }).initialIndex ?? 0;
      const t = target as { group?: string; index?: number } | null;
      const destGroup = t?.group ?? '';
      const destIndex = t?.index ?? 0;
      if (
        isDefined(targetAsSortable) &&
        isWorkspaceDroppableId(initialGroup) &&
        isWorkspaceDroppableId(destGroup)
      ) {
        const isCrossGroup = initialGroup !== destGroup;
        if (isCrossGroup) {
          const sourceWithSortable = source as {
            sortable?: { element?: Element };
          };
          const sourceElement = sourceWithSortable.sortable?.element;
          const sourceContainer =
            typeof document !== 'undefined'
              ? document.querySelector(`[data-dnd-group="${initialGroup}"]`)
              : null;
          if (sourceElement != null && sourceContainer != null) {
            const child = sourceContainer.children[initialIndex] ?? null;
            sourceContainer.insertBefore(sourceElement, child);
          }
        }
        const result = toDropResult(
          draggableId,
          { sourceDroppableId: initialGroup, sourceIndex: initialIndex },
          { droppableId: destGroup, index: destIndex },
        );
        const provided = {} as Parameters<typeof handleAddToNavigationDrop>[1];
        handleWorkspaceNavigationMenuItemDragAndDrop(
          {
            ...result,
            reason: 'DROP' as const,
            combine: null,
            mode: 'FLUID' as const,
            type: 'DEFAULT' as const,
          },
          provided,
        );
        return;
      }
    }

    const overId = target?.id;
    const targetAsSortable = target as {
      group?: string;
      index?: number;
    } | null;
    const destination =
      target &&
      isSortable(target as Parameters<typeof isSortable>[0]) &&
      targetAsSortable?.group != null &&
      targetAsSortable?.index != null
        ? {
            droppableId: targetAsSortable.group as string,
            index: targetAsSortable.index as number,
          }
        : typeof overId === 'string'
          ? parseDropTargetIdToDestination(overId)
          : sourceId === ADD_TO_NAV_SOURCE_DROPPABLE_ID && fallback
            ? fallback
            : null;

    const result = toDropResult(draggableId, data, destination);
    const provided = {} as Parameters<typeof handleAddToNavigationDrop>[1];
    const dropResult = {
      ...result,
      reason: 'DROP' as const,
      combine: null,
      mode: 'FLUID' as const,
      type: 'DEFAULT' as const,
    };

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
                sensors={sensors}
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
