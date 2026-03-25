import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const getAllRecordFilterDescendantsOfRecordFilterGroup = ({
  recordFilterGroupId,
  recordFilterGroups,
  recordFilters,
}: {
  recordFilterGroupId: string;
  recordFilterGroups: RecordFilterGroup[];
  recordFilters: RecordFilter[];
}): RecordFilter[] => {
  const foundRecordFilterGroup = recordFilterGroups.find(
    (recordFilterGroup) => recordFilterGroup.id === recordFilterGroupId,
  );

  if (!foundRecordFilterGroup) {
    return [];
  }

  const childRecordFilters = recordFilters.filter(
    (recordFilter) =>
      recordFilter.recordFilterGroupId === foundRecordFilterGroup.id,
  );

  const childRecordFilterGroups = recordFilterGroups.filter(
    (recordFilterGroup) =>
      recordFilterGroup.parentRecordFilterGroupId === foundRecordFilterGroup.id,
  );

  for (const childRecordFilterGroup of childRecordFilterGroups) {
    const childRecordFilterGroupDescendants =
      getAllRecordFilterDescendantsOfRecordFilterGroup({
        recordFilterGroupId: childRecordFilterGroup.id,
        recordFilterGroups,
        recordFilters,
      });

    childRecordFilters.push(...childRecordFilterGroupDescendants);
  }

  return childRecordFilters;
};
