import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const recordTableRow = {
  rowIndex: 2,
  isSelected: false,
  recordId: 'recordId',
  pathToShowPage: '/',
};

export const recordTableCell: {
  columnDefinition: ColumnDefinition<FieldMetadata>;
  columnIndex: number;
} = {
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
};
