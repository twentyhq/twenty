import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isPlainManyToOneRelationField } from '@/object-record/utils/isPlainManyToOneRelationField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { findById, isDefined } from 'twenty-shared/utils';

export type RecordFieldLookupTarget = {
  relationFieldName: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  lookupTargetFieldMetadataItem: FieldMetadataItem;
  lookupTargetFieldDefinition: FieldDefinition<FieldMetadata>;
};

export const getRecordFieldLookupTarget = ({
  recordField,
  fieldMetadataItem,
  objectMetadataItems,
  isLookupColumnsEnabled,
}: {
  recordField: Pick<RecordField, 'relationTargetFieldMetadataId'>;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isLookupColumnsEnabled: boolean;
}): RecordFieldLookupTarget | undefined => {
  // With the flag off a lookup column renders, loads and aggregates as its plain relation
  if (
    !isLookupColumnsEnabled ||
    !isDefined(recordField.relationTargetFieldMetadataId) ||
    !isPlainManyToOneRelationField(fieldMetadataItem)
  ) {
    return undefined;
  }

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem,
    objectMetadataItems,
  });

  const lookupTargetFieldMetadataItem = relationObjectMetadataItem?.fields.find(
    findById(recordField.relationTargetFieldMetadataId),
  );

  if (
    !isDefined(relationObjectMetadataItem) ||
    !isDefined(lookupTargetFieldMetadataItem)
  ) {
    return undefined;
  }

  return {
    relationFieldName: fieldMetadataItem.name,
    relationObjectMetadataItem,
    lookupTargetFieldMetadataItem,
    lookupTargetFieldDefinition: formatFieldMetadataItemAsFieldDefinition({
      field: lookupTargetFieldMetadataItem,
      objectMetadataItem: relationObjectMetadataItem,
    }),
  };
};
