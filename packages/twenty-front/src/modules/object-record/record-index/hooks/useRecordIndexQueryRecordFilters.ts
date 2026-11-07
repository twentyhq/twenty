import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexExcludedRecordFilterIds } from '@/object-record/record-index/hooks/useRecordIndexExcludedRecordFilterIds';
import { omitRecordFiltersExcludedFromQueries } from '@/object-record/record-index/utils/omitRecordFiltersExcludedFromQueries';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useMemo } from 'react';

// Excluded filters stay in the index state, so filter editors still show and save them.
// Groups are left as they are: an emptied group compiles to an empty `and`, which filters nothing.
export const useRecordIndexQueryRecordFilters = (instanceId?: string) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    instanceId,
  );
  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
    instanceId,
  );
  const excludedRecordFilterIds = useRecordIndexExcludedRecordFilterIds();

  const recordFilters = useMemo(
    () =>
      omitRecordFiltersExcludedFromQueries({
        recordFilters: currentRecordFilters,
        excludedRecordFilterIds,
      }),
    [currentRecordFilters, excludedRecordFilterIds],
  );

  return { recordFilters, recordFilterGroups: currentRecordFilterGroups };
};
