import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';

type RecordSortTarget = Pick<
  RecordSort,
  'fieldMetadataId' | 'relationTargetFieldMetadataId'
>;

// Two sorts target the same column when they share the field and, for a sort
// through a relation, the same target field on the related object.
export const isSameRecordSortTarget = (
  recordSortA: RecordSortTarget,
  recordSortB: RecordSortTarget,
) =>
  recordSortA.fieldMetadataId === recordSortB.fieldMetadataId &&
  (recordSortA.relationTargetFieldMetadataId ?? null) ===
    (recordSortB.relationTargetFieldMetadataId ?? null);
