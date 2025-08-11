import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const useChildRecordFiltersAndRecordFilterGroups = ({
  recordFilterGroupId,
}: {
  recordFilterGroupId?: string;
}) => {
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
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

  const lastChildPosition =
    childRecordFiltersAndRecordFilterGroups[
      childRecordFiltersAndRecordFilterGroups.length - 1
    ]?.positionInRecordFilterGroup ?? 0;

  return {
    currentRecordFilterGroup,
    childRecordFiltersAndRecordFilterGroups,
    childRecordFilters,
    childRecordFilterGroups,
    lastChildPosition,
  };
};
