import { createContext } from 'react';

export const MultiDragStateContext = createContext<{
  isDragging: boolean;
  draggedRecordIds: string[];
  primaryDraggedRecordId: string | null;
}>({
  isDragging: false,
  draggedRecordIds: [],
  primaryDraggedRecordId: null,
});
