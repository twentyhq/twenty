import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewFiltersToCreate } from '@/views/utils/getViewFiltersToCreate';
import { getViewFiltersToDelete } from '@/views/utils/getViewFiltersToDelete';
import { getViewFiltersToUpdate } from '@/views/utils/getViewFiltersToUpdate';
import { mapRecordFilterToViewFilter } from '@/views/utils/mapRecordFilterToViewFilter';
import { useMemo } from 'react';

export const useAreViewFiltersDifferentFromRecordFilters = () => {
  const { currentView } = useGetCurrentViewOnly();
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const viewFiltersAreDifferentFromRecordFilters = useMemo(() => {
    const currentViewFilters = currentView?.viewFilters ?? [];
    const viewFiltersFromCurrentRecordFilters = currentRecordFilters.map(
      mapRecordFilterToViewFilter,
    );

    const viewFiltersToCreate = getViewFiltersToCreate(
      currentViewFilters,
      viewFiltersFromCurrentRecordFilters,
    );

    const viewFiltersToDelete = getViewFiltersToDelete(
      currentViewFilters,
      viewFiltersFromCurrentRecordFilters,
    );

    const viewFiltersToUpdate = getViewFiltersToUpdate(
      currentViewFilters,
      viewFiltersFromCurrentRecordFilters,
    );

    const filtersHaveChanged =
      viewFiltersToCreate.length > 0 ||
      viewFiltersToDelete.length > 0 ||
      viewFiltersToUpdate.length > 0;

    return filtersHaveChanged;
  }, [currentRecordFilters, currentView]);

  return { viewFiltersAreDifferentFromRecordFilters };
};
