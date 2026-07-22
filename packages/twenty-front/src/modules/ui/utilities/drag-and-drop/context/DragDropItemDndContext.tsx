import { createContext } from 'react';

type DragDropItemDndContextValue = {
  activeDropTargetIndex: number | null;
  activeDroppableId?: string | null;
};

export const DragDropItemDndContext =
  createContext<DragDropItemDndContextValue>({
    activeDropTargetIndex: null,
    activeDroppableId: null,
  });
