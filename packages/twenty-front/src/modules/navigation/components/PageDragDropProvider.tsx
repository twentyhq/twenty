import {
  DragDropContext,
  type DragStart,
  type DropResult,
  type OnDragUpdateResponder,
  type ResponderProvided,
} from '@hello-pangea/dnd';
import { type ReactNode, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { FavoritesDragContext } from '@/favorites/contexts/FavoritesDragContext';
import { useHandleFavoriteDragAndDrop } from '@/favorites/hooks/useHandleFavoriteDragAndDrop';
import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/constants/AddToNavSourceDroppableId';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useHandleAddToNavigationDrop } from '@/navigation-menu-item/hooks/useHandleAddToNavigationDrop';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleNavigationMenuItemDragAndDrop';
import { useHandleWorkspaceNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleWorkspaceNavigationMenuItemDragAndDrop';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { addToNavPayloadRegistryStateV2 } from '@/navigation-menu-item/states/addToNavPayloadRegistryStateV2';
import { getDropTargetIdFromDestination } from '@/navigation-menu-item/utils/getDropTargetIdFromDestination';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';
import { useStore } from 'jotai';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';

type PageDragDropProviderProps = {
  children: ReactNode;
};

export const PageDragDropProvider = ({
  children,
}: PageDragDropProviderProps) => {
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
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
  const { handleNavigationMenuItemDragAndDrop } =
    useHandleNavigationMenuItemDragAndDrop();
  const { handleWorkspaceNavigationMenuItemDragAndDrop } =
    useHandleWorkspaceNavigationMenuItemDragAndDrop();
  const { handleFavoriteDragAndDrop } = useHandleFavoriteDragAndDrop();

  const orphanItemCount = workspaceNavigationMenuItems.filter(
    (item) => !isDefined(item.folderId),
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

  const handleDragUpdate = useRecoilCallback(
    () =>
      ((update: Parameters<OnDragUpdateResponder>[0]) => {
        const { source, destination } = update;
        if (source.droppableId !== ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
          return;
        }
        if (
          destination !== null &&
          isWorkspaceDroppableId(destination.droppableId)
        ) {
          setAddToNavigationFallbackDestination(destination);
          const dropTargetId = getDropTargetIdFromDestination(destination);
          setActiveDropTargetId(dropTargetId);

          const payload =
            store
              .get(addToNavPayloadRegistryStateV2.atom)
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
      }) as OnDragUpdateResponder,
    [addToNavigationFallbackDestination, store],
  );

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

    if (isNavigationMenuItemEditingEnabled) {
      const isWorkspaceDrop =
        isWorkspaceDroppableId(result.source?.droppableId) &&
        isWorkspaceDroppableId(result.destination?.droppableId);
      if (isWorkspaceDrop) {
        handleWorkspaceNavigationMenuItemDragAndDrop(result, provided);
      } else {
        handleNavigationMenuItemDragAndDrop(result, provided);
      }
    } else {
      handleFavoriteDragAndDrop(result, provided);
    }
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
