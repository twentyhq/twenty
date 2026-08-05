import { createContext } from 'react';

export type DragDropItemDndContextValue = {
  activeDropTargetIndex: number | null;
  activeDroppableId?: string | null;
};

export const DragDropItemDndContext =
  createContext<DragDropItemDndContextValue>({
    activeDropTargetIndex: null,
    activeDroppableId: null,
  });
