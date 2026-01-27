import { createContext } from 'react';

type NavigationMenuItemDragContextType = {
  isDragging: boolean;
};

export const NavigationMenuItemDragContext =
  createContext<NavigationMenuItemDragContextType>({
    isDragging: false,
  });
