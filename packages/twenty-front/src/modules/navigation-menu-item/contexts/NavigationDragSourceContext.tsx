import { createContext } from 'react';

type NavigationDragSourceContextType = {
  sourceDroppableId: string | null;
};

export const NavigationDragSourceContext =
  createContext<NavigationDragSourceContextType>({
    sourceDroppableId: null,
  });
