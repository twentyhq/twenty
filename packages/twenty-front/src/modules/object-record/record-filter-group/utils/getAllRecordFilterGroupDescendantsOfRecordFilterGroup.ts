import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

export const getAllRecordFilterGroupDescendantsOfRecordFilterGroup = ({
  recordFilterGroupId,
  recordFilterGroups,
}: {
  recordFilterGroupId: string;
  recordFilterGroups: RecordFilterGroup[];
}): RecordFilterGroup[] =>
  recordFilterGroups
    .filter(
      (recordFilterGroup) =>
        recordFilterGroup.parentRecordFilterGroupId === recordFilterGroupId,
    )
    .flatMap((childRecordFilterGroup) => [
      childRecordFilterGroup,
      ...getAllRecordFilterGroupDescendantsOfRecordFilterGroup({
        recordFilterGroupId: childRecordFilterGroup.id,
        recordFilterGroups,
      }),
    ]);
