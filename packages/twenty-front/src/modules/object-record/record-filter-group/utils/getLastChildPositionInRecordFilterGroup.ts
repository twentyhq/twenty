import { isNonEmptyArray } from 'twenty-shared/utils';

import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const getLastChildPositionInRecordFilterGroup = ({
  recordFilterGroupId,
  recordFilters,
  recordFilterGroups,
}: {
  recordFilterGroupId: string;
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
}): number => {
  const childPositions = [
    ...recordFilters.filter(
      (recordFilter) =>
        recordFilter.recordFilterGroupId === recordFilterGroupId,
    ),
    ...recordFilterGroups.filter(
      (recordFilterGroup) =>
        recordFilterGroup.parentRecordFilterGroupId === recordFilterGroupId,
    ),
  ].map((child) => child.positionInRecordFilterGroup ?? 0);

  return isNonEmptyArray(childPositions) ? Math.max(...childPositions) : 0;
};
