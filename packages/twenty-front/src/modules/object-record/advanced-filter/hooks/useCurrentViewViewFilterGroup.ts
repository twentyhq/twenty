import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { isDefined } from 'twenty-shared';

export const useCurrentViewViewFilterGroup = ({
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
      currentViewFilterGroup: undefined,
      childViewFiltersAndViewFilterGroups: [] as (
        | ViewFilter
        | ViewFilterGroup
      )[],
    };
  }

  const childRecordFilters = currentRecordFilters.filter(
    (recordFilterToFilter) =>
      recordFilterToFilter.recordFilterGroupId === currentRecordFilterGroup.id,
  );

  const childViewFilterGroups = currentRecordFilterGroups.filter(
    (currentRecordGroupToFilter) =>
      currentRecordGroupToFilter.parentRecordFilterGroupId ===
      currentRecordFilterGroup.id,
  );

  const childViewFiltersAndViewFilterGroups = [
    ...(childViewFilterGroups ?? []),
    ...(childRecordFilters ?? []),
  ].sort((a, b) => {
    const positionA = a.positionInRecordFilterGroup ?? 0;
    const positionB = b.positionInRecordFilterGroup ?? 0;
    return positionA - positionB;
  });

  const lastChildPosition =
    childViewFiltersAndViewFilterGroups[
      childViewFiltersAndViewFilterGroups.length - 1
    ]?.positionInRecordFilterGroup ?? 0;

  return {
    currentViewFilterGroup: currentRecordFilterGroup,
    childViewFiltersAndViewFilterGroups,
    lastChildPosition,
  };
};
