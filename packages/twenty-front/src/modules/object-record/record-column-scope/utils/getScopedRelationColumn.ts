import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationLookupTarget } from '@/object-record/record-column-lookup/utils/getRelationLookupTarget';
import { getRecordFieldSummary } from '@/object-record/record-column-summary/utils/getRecordFieldSummary';
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
  | (Pick<
      ScopedRelationAlias,
      | 'relationObjectMetadataItem'
      | 'lookupTarget'
      | 'scopedRelationJunction'
      | 'summary'
    > &
      Partial<Pick<ScopedRelationAlias, 'isRestricted'>>)
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

  if (isDefined(recordField.relationScope.aggregateOperation)) {
    const summary = getRecordFieldSummary({
      aggregateOperation: recordField.relationScope.aggregateOperation,
      relationTargetFieldMetadataId: recordField.relationTargetFieldMetadataId,
      relationObjectMetadataItem: scopableRelation.relationObjectMetadataItem,
    });

    // The server validates the operation, so a missing summary means its field is unreadable
    return isDefined(summary)
      ? { ...scopableRelation, summary }
      : { ...scopableRelation, isRestricted: true };
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
