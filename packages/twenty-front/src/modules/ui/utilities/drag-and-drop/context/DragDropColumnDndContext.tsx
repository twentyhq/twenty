import { createContext } from 'react';

type DragDropColumnDndContextValue = {
  activeDropTargetIndex: number | null;
};

export const DragDropColumnDndContext =
  createContext<DragDropColumnDndContextValue>({
    activeDropTargetIndex: null,
  });
