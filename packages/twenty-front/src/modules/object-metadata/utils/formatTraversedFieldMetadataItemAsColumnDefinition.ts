import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getTraversedFieldLabel } from '@/object-record/record-field/utils/getTraversedFieldLabel';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

type FormatTraversedFieldMetadataItemAsColumnDefinitionProps = {
  relationFieldMetadataItem: FieldMetadataItem;
  targetFieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
  position: number;
  labelWidth?: number;
};

export const formatTraversedFieldMetadataItemAsColumnDefinition = ({
  relationFieldMetadataItem,
  targetFieldMetadataItem,
  targetObjectMetadataItem,
  position,
  labelWidth,
}: FormatTraversedFieldMetadataItemAsColumnDefinitionProps): ColumnDefinition<FieldMetadata> => {
  const targetFieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: targetFieldMetadataItem,
    objectMetadataItem: targetObjectMetadataItem,
    labelWidth,
  });

  return {
    ...targetFieldDefinition,
    label: getTraversedFieldLabel({
      relationFieldLabel: relationFieldMetadataItem.label,
      targetFieldLabel: targetFieldMetadataItem.label,
    }),
    // The value belongs to the related record; editing it from this row is not supported.
    isUIEditable: false,
    metadata: {
      ...targetFieldDefinition.metadata,
      isUIEditable: false,
    },
    relationTraversal: {
      relationFieldMetadataId: relationFieldMetadataItem.id,
      relationFieldName: relationFieldMetadataItem.name,
      relationFieldLabel: relationFieldMetadataItem.label,
      relationTargetObjectMetadataId: targetObjectMetadataItem.id,
    },
    position,
    size: 100,
    isLabelIdentifier: false,
    isVisible: true,
  };
};
