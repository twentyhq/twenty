import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useChildRecordFiltersAndRecordFilterGroups = ({
  recordFilterGroupId,
}: {
  recordFilterGroupId?: string;
}) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );

  const unresolvedRecordFilters = useAtomComponentStateValue(
    unresolvedRecordFiltersComponentState,
  );

  const currentRecordFilterGroup = currentRecordFilterGroups.find(
    (recordFilterGroup) => recordFilterGroup.id === recordFilterGroupId,
  );

  if (!isDefined(currentRecordFilterGroup)) {
    return {
      currentRecordFilterGroup: undefined,
      childRecordFiltersAndRecordFilterGroups: [] as Array<
        RecordFilter | RecordFilterGroup
      >,
      childRecordFilters: [] as RecordFilter[],
      childRecordFilterGroups: [] as RecordFilterGroup[],
      childUnresolvedRecordFilters: [] as PersistedRecordFilter[],
      lastChildPosition: 0,
    };
  }

  const childRecordFilters = currentRecordFilters.filter(
    (recordFilterToFilter) =>
      recordFilterToFilter.recordFilterGroupId === currentRecordFilterGroup.id,
  );

  const childRecordFilterGroups = currentRecordFilterGroups.filter(
    (currentRecordGroupToFilter) =>
      currentRecordGroupToFilter.parentRecordFilterGroupId ===
      currentRecordFilterGroup.id,
  );

  const childRecordFiltersAndRecordFilterGroups = [
    ...childRecordFilterGroups,
    ...childRecordFilters,
  ].sort((a, b) => {
    const positionA = a.positionInRecordFilterGroup ?? 0;
    const positionB = b.positionInRecordFilterGroup ?? 0;
    return positionA - positionB;
  });

  const childUnresolvedRecordFilters = unresolvedRecordFilters.filter(
    (unresolvedRecordFilter) =>
      unresolvedRecordFilter.recordFilterGroupId ===
      currentRecordFilterGroup.id,
  );

  const lastChildPosition = Math.max(
    0,
    ...[
      ...childRecordFiltersAndRecordFilterGroups,
      ...childUnresolvedRecordFilters,
    ].map((child) => child.positionInRecordFilterGroup ?? 0),
  );

  return {
    currentRecordFilterGroup,
    childRecordFiltersAndRecordFilterGroups,
    childRecordFilters,
    childRecordFilterGroups,
    childUnresolvedRecordFilters,
    lastChildPosition,
  };
};
