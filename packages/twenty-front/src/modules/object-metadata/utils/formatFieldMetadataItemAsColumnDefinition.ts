import {
  FieldMetadataItemAsFieldDefinitionProps,
  formatFieldMetadataItemAsFieldDefinition,
} from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

type FieldMetadataItemAsColumnDefinitionProps = {
  position: number;
} & FieldMetadataItemAsFieldDefinitionProps;

export const formatFieldMetadataItemAsColumnDefinition = ({
  position,
  field,
  objectMetadataItem,
  showLabel,
  labelWidth,
}: FieldMetadataItemAsColumnDefinitionProps): ColumnDefinition<FieldMetadata> => ({
  ...formatFieldMetadataItemAsFieldDefinition({
    field,
    objectMetadataItem,
    showLabel,
    labelWidth,
  }),
  position,
  size: 100,
  isVisible: true,
});
