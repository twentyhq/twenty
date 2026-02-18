import {
  DragDropContext,
  type DragStart,
  type DropResult,
  type ResponderProvided,
} from '@hello-pangea/dnd';
import { type ReactNode, useState } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { FavoritesDragContext } from '@/favorites/contexts/FavoritesDragContext';
import { useHandleFavoriteDragAndDrop } from '@/favorites/hooks/useHandleFavoriteDragAndDrop';
import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleNavigationMenuItemDragAndDrop';
import { useHandleWorkspaceNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleWorkspaceNavigationMenuItemDragAndDrop';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type NavbarDragProviderProps = {
  children: ReactNode;
};

export const NavbarDragProvider = ({ children }: NavbarDragProviderProps) => {
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [sourceDroppableId, setSourceDroppableId] = useState<string | null>(
    null,
  );
  const { handleNavigationMenuItemDragAndDrop } =
    useHandleNavigationMenuItemDragAndDrop();
  const { handleWorkspaceNavigationMenuItemDragAndDrop } =
    useHandleWorkspaceNavigationMenuItemDragAndDrop();
  const { handleFavoriteDragAndDrop } = useHandleFavoriteDragAndDrop();

  const handleDragStart = (dragStart: DragStart) => {
    setIsDragging(true);
    setSourceDroppableId(dragStart.source.droppableId);
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    setSourceDroppableId(null);

    if (isNavigationMenuItemEditingEnabled) {
      const isWorkspaceDrop =
        (result.source?.droppableId?.startsWith('workspace-') ?? false) &&
        (result.destination?.droppableId?.startsWith('workspace-') ?? false);
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
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            {children}
          </DragDropContext>
        </FavoritesDragContext.Provider>
      </NavigationMenuItemDragContext.Provider>
    </NavigationDragSourceContext.Provider>
  );
};
