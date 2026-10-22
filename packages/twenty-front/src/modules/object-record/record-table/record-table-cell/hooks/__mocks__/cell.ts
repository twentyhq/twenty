import { RecordTableCellContextValue } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextValue } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextValue } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';

export const recordTableRowContextValue: RecordTableRowContextValue = {
  isSelected: false,
  recordId: 'recordId',
  pathToShowPage: '/',
  objectNameSingular: 'objectNameSingular',
};

export const recordTableRowDraggableContextValue: RecordTableRowDraggableContextValue =
  {
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
  columnIndex: 3,
};
