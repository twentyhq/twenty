import { createContext } from 'react';

type RecordTableHeaderDndContextValue = {
  activeDropTargetIndex: number | null;
};

export const RecordTableHeaderDndContext =
  createContext<RecordTableHeaderDndContextValue>({
    activeDropTargetIndex: null,
  });
