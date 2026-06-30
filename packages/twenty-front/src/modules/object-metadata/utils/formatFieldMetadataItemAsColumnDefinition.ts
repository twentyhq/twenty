import {
  formatFieldMetadataItemAsFieldDefinition,
  type FieldMetadataItemAsFieldDefinitionProps,
} from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

type FieldMetadataItemAsColumnDefinitionProps = {
  position: number;
} & FieldMetadataItemAsFieldDefinitionProps;

export const formatFieldMetadataItemAsColumnDefinition = ({
  position,
  field,
  objectMetadataItem,
  showLabel,
  labelWidth,
}: FieldMetadataItemAsColumnDefinitionProps): ColumnDefinition<FieldMetadata> => {
  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem: field,
    objectMetadataItem,
  });

  return {
    ...formatFieldMetadataItemAsFieldDefinition({
      field,
      objectMetadataItem,
      showLabel,
      labelWidth,
    }),
    position: isLabelIdentifier ? 0 : position,
    size: 100,
    isLabelIdentifier,
    isVisible: true,
  };
};
