import { createContext } from 'react';

type RecordTableHeaderDndContextValue = {
  isDragging: boolean;
  activeDropTargetIndex: number | null;
  activeDraggedSourceIndex: number | null;
};

export const RecordTableHeaderDndContext =
  createContext<RecordTableHeaderDndContextValue>({
    isDragging: false,
    activeDropTargetIndex: null,
    activeDraggedSourceIndex: null,
  });
