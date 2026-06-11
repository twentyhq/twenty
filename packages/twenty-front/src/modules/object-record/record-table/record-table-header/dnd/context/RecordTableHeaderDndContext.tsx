import { createContext } from 'react';

type RecordTableHeaderDndContextValue = {
  isDragging: boolean;
  activeDropTargetIndex: number | null;
  activeDraggedFieldMetadataItemId: string | null;
};

export const RecordTableHeaderDndContext =
  createContext<RecordTableHeaderDndContextValue>({
    isDragging: false,
    activeDropTargetIndex: null,
    activeDraggedFieldMetadataItemId: null,
  });
