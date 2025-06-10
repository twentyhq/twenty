import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useChildRecordFiltersAndRecordFilterGroups = ({
  recordFilterGroupId,
}: {
  recordFilterGroupId?: string;
}) => {
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilterGroups = useRecoilComponentValueV2(
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
