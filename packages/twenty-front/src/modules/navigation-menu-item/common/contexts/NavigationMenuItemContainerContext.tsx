import { createContext } from 'react';

type NavigationMenuItemContainerContextType = {
  containerId: string | null;
};

export const NavigationMenuItemContainerContext =
  createContext<NavigationMenuItemContainerContextType>({
    containerId: null,
  });
