import { type DragOperationType } from '@/object-record/record-drag/types/DragOperationType';

type DragOperationContext = {
  draggedRecordId: string;
  selectedRecordIds: string[];
};

export const getDragOperationType = ({
  draggedRecordId,
  selectedRecordIds,
}: DragOperationContext): DragOperationType => {
  const isDraggedItemSelected = selectedRecordIds.includes(draggedRecordId);
  const hasMultipleSelected = selectedRecordIds.length > 1;

  return isDraggedItemSelected && hasMultipleSelected ? 'multi' : 'single';
};
