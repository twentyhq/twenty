import {
  DragDropContext,
  type DragStart,
  type DropResult,
  type ResponderProvided,
} from '@hello-pangea/dnd';
import { type ReactNode, useState } from 'react';

import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleNavigationMenuItemDragAndDrop';
import { useHandleWorkspaceNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleWorkspaceNavigationMenuItemDragAndDrop';

type NavbarDragProviderProps = {
  children: ReactNode;
};

export const NavbarDragProvider = ({ children }: NavbarDragProviderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sourceDroppableId, setSourceDroppableId] = useState<string | null>(
    null,
  );
  const { handleNavigationMenuItemDragAndDrop } =
    useHandleNavigationMenuItemDragAndDrop();
  const { handleWorkspaceNavigationMenuItemDragAndDrop } =
    useHandleWorkspaceNavigationMenuItemDragAndDrop();

  const handleDragStart = (dragStart: DragStart) => {
    setIsDragging(true);
    setSourceDroppableId(dragStart.source.droppableId);
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    setSourceDroppableId(null);

    const isWorkspaceDrop =
      (result.source?.droppableId?.startsWith('workspace-') ?? false) &&
      (result.destination?.droppableId?.startsWith('workspace-') ?? false);
    if (isWorkspaceDrop) {
      handleWorkspaceNavigationMenuItemDragAndDrop(result, provided);
    } else {
      handleNavigationMenuItemDragAndDrop(result, provided);
    }
  };

  return (
    <NavigationDragSourceContext.Provider value={{ sourceDroppableId }}>
      <NavigationMenuItemDragContext.Provider value={{ isDragging }}>
        <DragDropContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          {children}
        </DragDropContext>
      </NavigationMenuItemDragContext.Provider>
    </NavigationDragSourceContext.Provider>
  );
};
