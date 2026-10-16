import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type GroupableRecordFilter = Pick<
  PersistedRecordFilter,
  'recordFilterGroupId' | 'positionInRecordFilterGroup'
>;

const attachUngroupedRecordFiltersToRecordFilterGroup = <
  TRecordFilter extends GroupableRecordFilter,
>({
  recordFilters,
  recordFilterGroups,
  recordFilterGroupId,
}: {
  recordFilters: TRecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  recordFilterGroupId: string;
}): TRecordFilter[] => {
  const lastChildPosition = Math.max(
    -1,
    ...[
      ...recordFilterGroups.filter(
        (recordFilterGroup) =>
          recordFilterGroup.parentRecordFilterGroupId === recordFilterGroupId,
      ),
      ...recordFilters.filter(
        (recordFilter) =>
          recordFilter.recordFilterGroupId === recordFilterGroupId,
      ),
    ].map((child) => child.positionInRecordFilterGroup ?? 0),
  );

  const ungroupedRecordFilters = recordFilters.filter(
    (recordFilter) => !isDefined(recordFilter.recordFilterGroupId),
  );

  return recordFilters.map((recordFilter) =>
    isDefined(recordFilter.recordFilterGroupId)
      ? recordFilter
      : {
          ...recordFilter,
          recordFilterGroupId,
          positionInRecordFilterGroup:
            lastChildPosition +
            1 +
            ungroupedRecordFilters.indexOf(recordFilter),
        },
  );
};

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

  if (
    !canAttachToRootRecordFilterGroup &&
    rootRecordFilterGroupHasChildGroups
  ) {
    return { recordFilters, recordFilterGroups };
  }

  if (canAttachToRootRecordFilterGroup) {
    return {
      recordFilters: attachUngroupedRecordFiltersToRecordFilterGroup({
        recordFilters,
        recordFilterGroups,
        recordFilterGroupId: rootRecordFilterGroup.id,
      }),
      recordFilterGroups,
    };
  }

  const newRootRecordFilterGroup: RecordFilterGroup = {
    id: v4(),
    logicalOperator: RecordFilterGroupLogicalOperator.AND,
  };

  const nextRecordFilterGroups = [
    newRootRecordFilterGroup,
    ...recordFilterGroups.map((recordFilterGroup) =>
      recordFilterGroup.id === rootRecordFilterGroup?.id
        ? {
            ...recordFilterGroup,
            parentRecordFilterGroupId: newRootRecordFilterGroup.id,
            positionInRecordFilterGroup: 0,
          }
        : recordFilterGroup,
    ),
  ];

  return {
    recordFilters: attachUngroupedRecordFiltersToRecordFilterGroup({
      recordFilters,
      recordFilterGroups: nextRecordFilterGroups,
      recordFilterGroupId: newRootRecordFilterGroup.id,
    }),
    recordFilterGroups: nextRecordFilterGroups,
  };
};
