import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';

// Relation-traversal filters reference target fields that live on a
// different object than the one being queried, so they aren't in the
// source object's own field list. The shared GraphQL filter dispatcher
// looks the target up by id in `fieldMetadataItems` and drops the filter
// when it can't find it — this helper merges the resolved target fields
// in from the workspace-wide flat list so callers don't silently lose
// relation-traversal filters.
export const augmentFieldsWithRelationTargets = ({
  baseFields,
  recordFilters,
  allFieldMetadataItems,
}: {
  baseFields: FieldMetadataItem[];
  recordFilters: Pick<RecordFilter, 'relationTargetFieldMetadataId'>[];
  allFieldMetadataItems: FieldMetadataItem[];
}): FieldMetadataItem[] => {
  const targetFieldIds = new Set(
    recordFilters
      .map((filter) => filter.relationTargetFieldMetadataId)
      .filter(isDefined),
  );

  if (targetFieldIds.size === 0) {
    return baseFields;
  }

  const baseFieldIds = new Set(baseFields.map((field) => field.id));
  const additionalTargetFields = allFieldMetadataItems.filter(
    (field) => targetFieldIds.has(field.id) && !baseFieldIds.has(field.id),
  );

  if (additionalTargetFields.length === 0) {
    return baseFields;
  }

  return [...baseFields, ...additionalTargetFields];
};
