import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const findRecordFieldLookupTargetFieldMetadataItem = ({
  recordField,
  fieldMetadataItem,
  objectMetadataItems,
}: {
  recordField: Pick<RecordField, 'relationTargetFieldMetadataId'>;
  fieldMetadataItem: Pick<FieldMetadataItem, 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): FieldMetadataItem | undefined => {
  if (!isDefined(recordField.relationTargetFieldMetadataId)) {
    return undefined;
  }

  return findRelationTargetObjectMetadataItem({
    fieldMetadataItem,
    objectMetadataItems,
  })?.fields.find(
    (field) => field.id === recordField.relationTargetFieldMetadataId,
  );
};
