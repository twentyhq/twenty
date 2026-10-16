import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { isDefined } from 'twenty-shared/utils';

export const removeEmptyRecordFilterGroups = ({
  recordFilters,
  recordFilterGroups,
}: {
  recordFilters: Pick<PersistedRecordFilter, 'recordFilterGroupId'>[];
  recordFilterGroups: RecordFilterGroup[];
}): RecordFilterGroup[] => {
  const nonEmptyRecordFilterGroupIds = new Set(
    [
      ...recordFilters.map(({ recordFilterGroupId }) => recordFilterGroupId),
      ...recordFilterGroups.map(
        ({ parentRecordFilterGroupId }) => parentRecordFilterGroupId,
      ),
    ].filter(isDefined),
  );

  const nonEmptyRecordFilterGroups = recordFilterGroups.filter(
    (recordFilterGroup) =>
      nonEmptyRecordFilterGroupIds.has(recordFilterGroup.id),
  );

  return nonEmptyRecordFilterGroups.length === recordFilterGroups.length
    ? recordFilterGroups
    : removeEmptyRecordFilterGroups({
        recordFilters,
        recordFilterGroups: nonEmptyRecordFilterGroups,
      });
};
