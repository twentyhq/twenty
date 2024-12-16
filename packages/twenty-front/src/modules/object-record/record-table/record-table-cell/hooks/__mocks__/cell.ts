import { RecordTableCellContextValue } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextValue } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextValue } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { FieldMetadataType } from '~/generated/graphql';

export const recordTableRowContextValue: RecordTableRowContextValue = {
  rowIndex: 2,
  isSelected: false,
  recordId: 'recordId',
  pathToShowPage: '/',
  objectNameSingular: 'objectNameSingular',
  isPendingRow: false,
  inView: true,
};

export const recordTableRowDraggableContextValue: RecordTableRowDraggableContextValue = {
  dragHandleProps: {} as any,
  isDragging: false,
};

export const recordTableCellContextValue: RecordTableCellContextValue = {
  columnIndex: 3,
  columnDefinition: {
    size: 1,
    position: 1,
    fieldMetadataId: 'fieldMetadataId',
    label: 'label',
    iconName: 'iconName',
    type: FieldMetadataType.Text,
    metadata: {
      placeHolder: 'placeHolder',
      fieldName: 'fieldName',
    },
  },
  cellPosition: {
    row: 2,
    column: 3,
  },
  hasSoftFocus: false,
  isInEditMode: false,
};
