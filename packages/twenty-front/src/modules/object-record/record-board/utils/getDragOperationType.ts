import { DragOperationType } from '../types/DragOperationType';

type DragOperationContext = {
  draggedRecordId: string;
  selectedRecordIds: string[];
};

export const getDragOperationType = (
  context: DragOperationContext,
): DragOperationType => {
  const { draggedRecordId, selectedRecordIds } = context;

  const isDraggedItemSelected = selectedRecordIds.includes(draggedRecordId);
  const hasMultipleSelected = selectedRecordIds.length > 1;

  return isDraggedItemSelected && hasMultipleSelected ? 'multi' : 'single';
};
