export type MultiDragState = {
  isDragging: boolean;
  draggedRecordIds: string[];
  primaryDraggedRecordId: string | null;
  originalSelection: string[];
};
