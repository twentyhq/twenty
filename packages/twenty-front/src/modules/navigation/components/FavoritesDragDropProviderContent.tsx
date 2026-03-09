import {
  DragDropContext,
  type DragStart,
  type DropResult,
  type OnDragUpdateResponder,
  type ResponderProvided,
} from '@hello-pangea/dnd';
import { useState, type ReactNode } from 'react';

import { FavoritesDragContext } from '@/favorites/contexts/FavoritesDragContext';
import { useHandleFavoriteDragAndDrop } from '@/favorites/hooks/useHandleFavoriteDragAndDrop';
import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useHandleAddToNavigationDrop } from '@/navigation-menu-item/hooks/useHandleAddToNavigationDrop';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleNavigationMenuItemDragAndDrop';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/states/addToNavPayloadRegistryState';
import { getDropTargetIdFromDestination } from '@/navigation-menu-item/utils/getDropTargetIdFromDestination';
import { getFavoritesDropTargetIdFromDestination } from '@/navigation-menu-item/utils/getFavoritesDropTargetIdFromDestination';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type FavoritesDragDropProviderContentProps = {
  children: ReactNode;
};

export const FavoritesDragDropProviderContent = ({
  children,
}: FavoritesDragDropProviderContentProps) => {
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
  const { handleFavoriteDragAndDrop } = useHandleFavoriteDragAndDrop();
  const { handleNavigationMenuItemDragAndDrop } =
    useHandleNavigationMenuItemDragAndDrop();

  const isFavoritesDroppableId = (droppableId: string) =>
    droppableId ===
      NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS ||
    droppableId.startsWith('folder-');

  const orphanItemCount = workspaceNavigationMenuItems.filter(
    (item: { folderId?: string | null }) => !isDefined(item.folderId),
  ).length;

  const handleDragStart = (dragStart: DragStart) => {
    setIsDragging(true);
    setSourceDroppableId(dragStart.source.droppableId);
    if (dragStart.source.droppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      const defaultDestination = {
        droppableId:
          NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
        index: orphanItemCount,
      };
      setAddToNavigationFallbackDestination(defaultDestination);
      setActiveDropTargetId(getDropTargetIdFromDestination(defaultDestination));
    }
  };

  const handleDragUpdate = (update: Parameters<OnDragUpdateResponder>[0]) => {
    const { source, destination } = update;

    if (source.droppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      if (
        destination !== null &&
        isWorkspaceDroppableId(destination.droppableId)
      ) {
        setAddToNavigationFallbackDestination(destination);
        const dropTargetId = getDropTargetIdFromDestination(destination);
        setActiveDropTargetId(dropTargetId);

        const payload =
          store
            .get(addToNavPayloadRegistryState.atom)
            .get(update.draggableId) ?? null;
        const folderId = validateAndExtractWorkspaceFolderId(
          destination.droppableId,
        );
        const isFolderOverFolder =
          payload?.type === 'folder' && folderId !== null;
        setForbiddenDropTargetId(isFolderOverFolder ? dropTargetId : null);
      } else {
        setForbiddenDropTargetId(null);
        const fallback = addToNavigationFallbackDestination;
        setActiveDropTargetId(
          fallback ? getDropTargetIdFromDestination(fallback) : null,
        );
      }
      return;
    }

    if (isFavoritesDroppableId(source.droppableId)) {
      if (isDefined(destination)) {
        const dropTargetId =
          getFavoritesDropTargetIdFromDestination(destination);
        setActiveDropTargetId(dropTargetId);
      } else {
        setActiveDropTargetId(null);
      }
    }
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const isAddToNavigationSource =
      result.source.droppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID;
    const effectiveResult: DropResult =
      isAddToNavigationSource &&
      !result.destination &&
      addToNavigationFallbackDestination
        ? { ...result, destination: addToNavigationFallbackDestination }
        : result;

    setIsDragging(false);
    setSourceDroppableId(null);
    setActiveDropTargetId(null);
    setForbiddenDropTargetId(null);
    setAddToNavigationFallbackDestination(null);

    if (isAddToNavigationSource) {
      handleAddToNavigationDrop(effectiveResult, provided);
      return;
    }

    if (isFavoritesDroppableId(result.source.droppableId)) {
      handleNavigationMenuItemDragAndDrop(result, provided);
      return;
    }

    handleFavoriteDragAndDrop(result, provided);
  };

  return (
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
            <DragDropContext
              onDragStart={handleDragStart}
              onDragUpdate={handleDragUpdate}
              onDragEnd={handleDragEnd}
            >
              {children}
            </DragDropContext>
          </NavigationDropTargetContext.Provider>
        </FavoritesDragContext.Provider>
      </NavigationMenuItemDragContext.Provider>
    </NavigationDragSourceContext.Provider>
  );
};
