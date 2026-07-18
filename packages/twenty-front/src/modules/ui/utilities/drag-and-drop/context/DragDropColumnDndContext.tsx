import { createContext } from 'react';

type DragDropColumnDndContextValue = {
  activeDropTargetIndex: number | null;
  activeDroppableId?: string | null;
};

export const DragDropColumnDndContext =
  createContext<DragDropColumnDndContextValue>({
    activeDropTargetIndex: null,
    activeDroppableId: null,
  });
