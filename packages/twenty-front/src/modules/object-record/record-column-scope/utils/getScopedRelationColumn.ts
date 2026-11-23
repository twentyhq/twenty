import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationLookupTarget } from '@/object-record/record-column-lookup/utils/getRelationLookupTarget';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { resolveScopableRelation } from '@/object-record/record-column-scope/utils/resolveScopableRelation';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { isDefined } from 'twenty-shared/utils';

export const getScopedRelationColumn = ({
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
}):
  | Pick<
      ScopedRelationAlias,
      'relationObjectMetadataItem' | 'lookupTarget' | 'scopedRelationJunction'
    >
  | undefined => {
  if (
    !isLookupColumnsEnabled ||
    isCanonicalRecordField(recordField) ||
    !isDefined(recordField.relationScope)
  ) {
    return undefined;
  }

  const scopableRelation = resolveScopableRelation({
    fieldMetadataItem,
    objectMetadataItems,
  });

  if (!isDefined(scopableRelation)) {
    return undefined;
  }

  // A field of the target records is two hops away, and a field of the join records is not what the column lists
  if (
    isDefined(scopableRelation.scopedRelationJunction) ||
    !isDefined(recordField.relationTargetFieldMetadataId)
  ) {
    return scopableRelation;
  }

  return {
    ...scopableRelation,
    lookupTarget: getRelationLookupTarget({
      relationFieldMetadataItem: fieldMetadataItem,
      relationTargetFieldMetadataId: recordField.relationTargetFieldMetadataId,
      objectMetadataItems,
    }),
  };
};
