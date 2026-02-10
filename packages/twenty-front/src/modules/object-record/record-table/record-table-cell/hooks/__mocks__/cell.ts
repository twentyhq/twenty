import type { RecordTableCellContextValue } from '@/object-record/record-table/contexts/RecordTableCellContext';
import type { RecordTableRowContextValue } from '@/object-record/record-table/contexts/RecordTableRowContext';
import type { RecordTableRowDraggableContextValue } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';

export const recordTableRowContextValue: RecordTableRowContextValue = {
  rowIndex: 2,
  isSelected: false,
  recordId: 'recordId',
  pathToShowPage: '/',
  objectNameSingular: 'objectNameSingular',
};

export const recordTableRowDraggableContextValue: RecordTableRowDraggableContextValue = {
  dragHandleProps: {} as any,
  isDragging: false,
};

export const recordTableCellContextValue: RecordTableCellContextValue = {
  recordField: {
    size: 1,
    position: 1,
    fieldMetadataItemId: 'fieldMetadataId',
    id: 'id',
    isVisible: true,
  },
  cellPosition: {
    row: 2,
    column: 3,
  },
};
