import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordTableRowDraggableContextValue = {
  isDragging: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
};

export const [
  RecordTableRowDraggableContextProvider,
  useRecordTableRowDraggableContextOrThrow,
] = createRequiredContext<RecordTableRowDraggableContextValue>(
  'RecordTableRowDraggableContext',
);
