import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined } from 'twenty-shared/utils';

// A field reached through a relation shares its fieldMetadataItemId with the
// plain relation column, so the key must carry the target to tell them apart.
export const getRecordFieldKey = (
  recordField: Pick<
    RecordField,
    'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
  >,
) => {
  if (!isDefined(recordField.relationTargetFieldMetadataItemId)) {
    return recordField.fieldMetadataItemId;
  }

  return `${recordField.fieldMetadataItemId}:${recordField.relationTargetFieldMetadataItemId}`;
};
