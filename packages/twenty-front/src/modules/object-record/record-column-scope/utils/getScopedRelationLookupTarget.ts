import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { getRelationLookupTarget } from '@/object-record/record-column-lookup/utils/getRelationLookupTarget';
import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';
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

  const { scopedRelationJunction } = resolveScopedRelationJunction({
    fieldMetadataItem,
    objectMetadataItems,
  });

  // A field of the target records is two hops away, and a field of the join records is not what the column lists
  if (isDefined(scopedRelationJunction)) {
    return undefined;
  }

  return getRelationLookupTarget({
    relationFieldMetadataItem: fieldMetadataItem,
    relationTargetFieldMetadataId: recordField.relationTargetFieldMetadataId,
    objectMetadataItems,
  });
};
