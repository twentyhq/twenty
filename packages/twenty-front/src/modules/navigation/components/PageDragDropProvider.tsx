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
import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useHandleAddToNavigationDrop } from '@/navigation-menu-item/hooks/useHandleAddToNavigationDrop';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleNavigationMenuItemDragAndDrop';
import { useHandleWorkspaceNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleWorkspaceNavigationMenuItemDragAndDrop';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/states/addToNavPayloadRegistryState';
import { getDropTargetIdFromDestination } from '@/navigation-menu-item/utils/getDropTargetIdFromDestination';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';
import { validateAndExtractWorkspaceFolderId } from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type PageDragDropProviderProps = {
  children: ReactNode;
};

export const PageDragDropProvider = ({
  children,
}: PageDragDropProviderProps) => {
  const isNavigationMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
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

  const { handleAddToNavigationDrop } = useHandleAddToNavigationDrop();
  const { handleNavigationMenuItemDragAndDrop } =
    useHandleNavigationMenuItemDragAndDrop();
  const { handleWorkspaceNavigationMenuItemDragAndDrop } =
    useHandleWorkspaceNavigationMenuItemDragAndDrop();
  const { handleFavoriteDragAndDrop } = useHandleFavoriteDragAndDrop();

  const handleDragStart = (dragStart: DragStart) => {
    setIsDragging(true);
    setSourceDroppableId(dragStart.source.droppableId);
  };

  const handleDragUpdate = useRecoilCallback(
    ({ snapshot }) =>
      ((update: Parameters<OnDragUpdateResponder>[0]) => {
        const { source, destination } = update;
        if (source.droppableId !== ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
          return;
        }
        if (!destination || !isWorkspaceDroppableId(destination.droppableId)) {
          setActiveDropTargetId(null);
          setForbiddenDropTargetId(null);
          return;
        }
        const dropTargetId = getDropTargetIdFromDestination(destination);
        setActiveDropTargetId(dropTargetId);

        const payload =
          getSnapshotValue(snapshot, addToNavPayloadRegistryState).get(
            update.draggableId,
          ) ?? null;
        const folderId = validateAndExtractWorkspaceFolderId(
          destination.droppableId,
        );
        const isFolderOverFolder =
          payload?.type === 'folder' && folderId !== null;
        setForbiddenDropTargetId(isFolderOverFolder ? dropTargetId : null);
      }) as OnDragUpdateResponder,
    [],
  );

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    setSourceDroppableId(null);
    setActiveDropTargetId(null);
    setForbiddenDropTargetId(null);

    if (result.source.droppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
      handleAddToNavigationDrop(result, provided);
      return;
    }

    if (isNavigationMenuItemEnabled) {
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
