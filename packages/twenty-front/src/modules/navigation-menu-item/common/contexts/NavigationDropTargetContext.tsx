import { createContext } from 'react';

type NavigationDropTargetContextType = {
  activeDropTargetId: string | null;
  setActiveDropTargetId: (id: string | null) => void;
  forbiddenDropTargetId: string | null;
  setForbiddenDropTargetId: (id: string | null) => void;
};

export const NavigationDropTargetContext =
  createContext<NavigationDropTargetContextType>({
    activeDropTargetId: null,
    setActiveDropTargetId: () => {},
    forbiddenDropTargetId: null,
    setForbiddenDropTargetId: () => {},
  });
