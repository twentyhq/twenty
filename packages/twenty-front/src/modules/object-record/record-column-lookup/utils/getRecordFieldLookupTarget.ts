import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isPlainManyToOneRelationField } from '@/object-record/utils/isPlainManyToOneRelationField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { findById, isDefined } from 'twenty-shared/utils';

export type RecordFieldLookupTarget = {
  relationFieldName: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  lookupTargetFieldMetadataItem: FieldMetadataItem;
};

export const getRecordFieldLookupTarget = ({
  recordField,
  fieldMetadataItem,
  objectMetadataItems,
}: {
  recordField: Pick<RecordField, 'relationTargetFieldMetadataId'>;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordFieldLookupTarget | undefined => {
  if (
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
  };
};
