import { RecordTableCellContextValue } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextValue } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextValue } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const recordTableRowContextValue: RecordTableRowContextValue = {
  rowIndex: 2,
  isSelected: false,
  recordId: 'recordId',
  pathToShowPage: '/',
  objectNameSingular: 'objectNameSingular',
  inView: true,
};

export const recordTableRowDraggableContextValue: RecordTableRowDraggableContextValue = {
  dragHandleProps: {} as any,
  isDragging: false,
};

export const recordTableCellContextValue: RecordTableCellContextValue = {
  columnDefinition: {
    size: 1,
    position: 1,
    fieldMetadataId: 'fieldMetadataId',
    label: 'label',
    iconName: 'iconName',
    type: FieldMetadataType.TEXT,
    metadata: {
      placeHolder: 'placeHolder',
      fieldName: 'fieldName',
    },
  },
  cellPosition: {
    row: 2,
    column: 3,
  },
};
