import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableCellContextProps } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProps } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const recordTableRow: RecordTableRowContextProps = {
  rowIndex: 2,
  isSelected: false,
  recordId: 'recordId',
  pathToShowPage: '/',
  objectNameSingular: 'objectNameSingular',
  isReadOnly: false,
  dragHandleProps: {} as any,
  isDragging: false,
  inView: true,
  isPendingRow: false,
};

export const recordTableCell:RecordTableCellContextProps= {
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
    row: 1,
    column: 1,
  },
  hasSoftFocus: false,
  isInEditMode: false,
};
