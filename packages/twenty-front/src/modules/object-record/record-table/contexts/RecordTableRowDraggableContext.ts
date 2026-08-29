import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordTableRowDraggableContextValue = {
  isDragging: boolean;
};

export const [
  RecordTableRowDraggableContextProvider,
  useRecordTableRowDraggableContextOrThrow,
] = createRequiredContext<RecordTableRowDraggableContextValue>(
  'RecordTableRowDraggableContext',
);
