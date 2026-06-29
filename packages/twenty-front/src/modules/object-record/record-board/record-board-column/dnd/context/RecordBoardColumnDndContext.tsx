import { createContext } from 'react';

type RecordBoardColumnDndContextValue = {
  activeDropTargetIndex: number | null;
};

export const RecordBoardColumnDndContext =
  createContext<RecordBoardColumnDndContextValue>({
    activeDropTargetIndex: null,
  });
