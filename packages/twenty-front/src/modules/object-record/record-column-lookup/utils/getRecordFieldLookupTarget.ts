import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { getRelationLookupTarget } from '@/object-record/record-column-lookup/utils/getRelationLookupTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isPlainManyToOneRelationField } from '@/object-record/utils/isPlainManyToOneRelationField';
import { isDefined } from 'twenty-shared/utils';

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

  return getRelationLookupTarget({
    relationFieldMetadataItem: fieldMetadataItem,
    relationTargetFieldMetadataId: recordField.relationTargetFieldMetadataId,
    objectMetadataItems,
  });
};
