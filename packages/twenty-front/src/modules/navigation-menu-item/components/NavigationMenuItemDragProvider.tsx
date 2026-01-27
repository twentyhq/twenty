import {
  DragDropContext,
  type DragStart,
  type DropResult,
  type ResponderProvided,
} from '@hello-pangea/dnd';
import { type ReactNode, useState } from 'react';

import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useHandleNavigationMenuItemDragAndDrop } from '@/navigation-menu-item/hooks/useHandleNavigationMenuItemDragAndDrop';

type NavigationMenuItemDragProviderProps = {
  children: ReactNode;
};

export const NavigationMenuItemDragProvider = ({
  children,
}: NavigationMenuItemDragProviderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { handleNavigationMenuItemDragAndDrop } =
    useHandleNavigationMenuItemDragAndDrop();

  const handleDragStart = (_: DragStart) => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    handleNavigationMenuItemDragAndDrop(result, provided);
  };

  return (
    <NavigationMenuItemDragContext.Provider value={{ isDragging }}>
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        {children}
      </DragDropContext>
    </NavigationMenuItemDragContext.Provider>
  );
};
