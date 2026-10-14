import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type GroupableRecordFilter = Pick<
  PersistedRecordFilter,
  'recordFilterGroupId' | 'positionInRecordFilterGroup'
>;

// The advanced filter editor only renders the root group's descendants, while
// filters without a group are ANDed with the root group when records are
// queried, so they are moved under an AND root to stay visible with the same
// meaning
export const attachUngroupedRecordFiltersToRootRecordFilterGroup = <
  TRecordFilter extends GroupableRecordFilter,
>({
  recordFilters,
  recordFilterGroups,
}: {
  recordFilters: TRecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
}): {
  recordFilters: TRecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
} => {
  const hasUngroupedRecordFilters = recordFilters.some(
    (recordFilter) => !isDefined(recordFilter.recordFilterGroupId),
  );

  if (!hasUngroupedRecordFilters) {
    return { recordFilters, recordFilterGroups };
  }

  const rootRecordFilterGroup = recordFilterGroups.find(
    (recordFilterGroup) =>
      !isDefined(recordFilterGroup.parentRecordFilterGroupId),
  );

  const canAttachToRootRecordFilterGroup =
    isDefined(rootRecordFilterGroup) &&
    rootRecordFilterGroup.logicalOperator ===
      RecordFilterGroupLogicalOperator.AND;

  const rootRecordFilterGroupHasChildGroups =
    isDefined(rootRecordFilterGroup) &&
    recordFilterGroups.some(
      (recordFilterGroup) =>
        recordFilterGroup.parentRecordFilterGroupId ===
        rootRecordFilterGroup.id,
    );

  // Nesting an OR root that has child groups would add a third level, which
  // the editor cannot render
  if (
    !canAttachToRootRecordFilterGroup &&
    rootRecordFilterGroupHasChildGroups
  ) {
    return { recordFilters, recordFilterGroups };
  }

  const targetRecordFilterGroup: RecordFilterGroup =
    canAttachToRootRecordFilterGroup
      ? rootRecordFilterGroup
      : { id: v4(), logicalOperator: RecordFilterGroupLogicalOperator.AND };

  const nextRecordFilterGroups = canAttachToRootRecordFilterGroup
    ? recordFilterGroups
    : [
        targetRecordFilterGroup,
        ...recordFilterGroups.map((recordFilterGroup) =>
          recordFilterGroup.id === rootRecordFilterGroup?.id
            ? {
                ...recordFilterGroup,
                parentRecordFilterGroupId: targetRecordFilterGroup.id,
                positionInRecordFilterGroup: 0,
              }
            : recordFilterGroup,
        ),
      ];

  const lastChildPosition = Math.max(
    -1,
    ...[
      ...nextRecordFilterGroups.filter(
        (recordFilterGroup) =>
          recordFilterGroup.parentRecordFilterGroupId ===
          targetRecordFilterGroup.id,
      ),
      ...recordFilters.filter(
        (recordFilter) =>
          recordFilter.recordFilterGroupId === targetRecordFilterGroup.id,
      ),
    ].map((child) => child.positionInRecordFilterGroup ?? 0),
  );

  let nextChildPosition = lastChildPosition + 1;

  const nextRecordFilters = recordFilters.map((recordFilter) =>
    isDefined(recordFilter.recordFilterGroupId)
      ? recordFilter
      : {
          ...recordFilter,
          recordFilterGroupId: targetRecordFilterGroup.id,
          positionInRecordFilterGroup: nextChildPosition++,
        },
  );

  return {
    recordFilters: nextRecordFilters,
    recordFilterGroups: nextRecordFilterGroups,
  };
};
