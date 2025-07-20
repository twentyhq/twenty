import { createContext } from 'react';

export const MultiDragStateContext = createContext<{
  isDragging: boolean;
  draggedRecordIds: string[];
  primaryDraggedRecordId: string | null;
  originalSelection: string[];
}>({
  isDragging: false,
  draggedRecordIds: [],
  primaryDraggedRecordId: null,
  originalSelection: [],
});
