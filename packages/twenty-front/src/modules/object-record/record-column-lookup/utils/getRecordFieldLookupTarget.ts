import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export type RecordFieldLookupTarget = {
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  lookupTargetFieldMetadataItem: FieldMetadataItem;
};

export const getRecordFieldLookupTarget = ({
  recordField,
  fieldMetadataItem,
  objectMetadataItems,
}: {
  recordField: Pick<RecordField, 'relationTargetFieldMetadataId'>;
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordFieldLookupTarget | undefined => {
  if (
    !isDefined(recordField.relationTargetFieldMetadataId) ||
    !isManyToOneRelationField(fieldMetadataItem)
  ) {
    return undefined;
  }

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem,
    objectMetadataItems,
  });

  const lookupTargetFieldMetadataItem = relationObjectMetadataItem?.fields.find(
    ({ id }) => id === recordField.relationTargetFieldMetadataId,
  );

  if (
    !isDefined(relationObjectMetadataItem) ||
    !isDefined(lookupTargetFieldMetadataItem)
  ) {
    return undefined;
  }

  return { relationObjectMetadataItem, lookupTargetFieldMetadataItem };
};
