import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { getRelationLookupTarget } from '@/object-record/record-column-lookup/utils/getRelationLookupTarget';
import { getRecordFieldSummary } from '@/object-record/record-column-summary/utils/getRecordFieldSummary';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getScopedRelationColumn = ({
  recordField,
  fieldMetadataItem,
  objectMetadataItems,
  isLookupColumnsEnabled,
}: {
  recordField: Pick<
    RecordField,
    | 'isCanonical'
    | 'relationScope'
    | 'relationTargetFieldMetadataId'
    | 'relationAggregateOperation'
  >;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isLookupColumnsEnabled: boolean;
}):
  | Pick<
      ScopedRelationAlias,
      'lookupTarget' | 'scopedRelationJunction' | 'summary'
    >
  | undefined => {
  if (
    !isLookupColumnsEnabled ||
    isCanonicalRecordField(recordField) ||
    !isDefined(recordField.relationScope) ||
    !isOneToManyRelationField(fieldMetadataItem)
  ) {
    return undefined;
  }

  const { status, scopedRelationJunction } = resolveScopedRelationJunction({
    fieldMetadataItem,
    objectMetadataItems,
  });

  if (status === 'unsupported') {
    return undefined;
  }

  if (isDefined(recordField.relationAggregateOperation)) {
    const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
      fieldMetadataItem,
      objectMetadataItems,
    });

    const summary = isDefined(relationObjectMetadataItem)
      ? getRecordFieldSummary({ recordField, relationObjectMetadataItem })
      : undefined;

    return isDefined(summary) ? { scopedRelationJunction, summary } : undefined;
  }

  // A field of the target records is two hops away, and a field of the join records is not what the column lists
  const lookupTarget =
    isDefined(scopedRelationJunction) ||
    !isDefined(recordField.relationTargetFieldMetadataId)
      ? undefined
      : getRelationLookupTarget({
          relationFieldMetadataItem: fieldMetadataItem,
          relationTargetFieldMetadataId:
            recordField.relationTargetFieldMetadataId,
          objectMetadataItems,
        });

  return { lookupTarget, scopedRelationJunction };
};
