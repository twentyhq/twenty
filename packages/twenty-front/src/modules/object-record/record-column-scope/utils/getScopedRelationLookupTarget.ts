import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { getRelationLookupTarget } from '@/object-record/record-column-lookup/utils/getRelationLookupTarget';
import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined } from 'twenty-shared/utils';

export const getScopedRelationLookupTarget = ({
  recordField,
  fieldMetadataItem,
  objectMetadataItems,
  isLookupColumnsEnabled,
}: {
  recordField: Pick<
    RecordField,
    'isCanonical' | 'relationScope' | 'relationTargetFieldMetadataId'
  >;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isLookupColumnsEnabled: boolean;
}): RecordFieldLookupTarget | undefined => {
  if (
    !isDefined(recordField.relationTargetFieldMetadataId) ||
    !isScopedRelationColumn({
      fieldMetadataItem,
      recordField,
      isLookupColumnsEnabled,
    })
  ) {
    return undefined;
  }

  return getRelationLookupTarget({
    relationFieldMetadataItem: fieldMetadataItem,
    relationTargetFieldMetadataId: recordField.relationTargetFieldMetadataId,
    objectMetadataItems,
  });
};
