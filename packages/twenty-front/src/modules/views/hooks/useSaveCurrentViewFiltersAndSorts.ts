import { useSaveRecordFilterGroupsToViewFilterGroups } from '@/views/hooks/useSaveRecordFilterGroupsToViewFilterGroups';
import { useSaveRecordFiltersToViewFilters } from '@/views/hooks/useSaveRecordFiltersToViewFilters';
import { useSaveRecordSortsToViewSorts } from '@/views/hooks/useSaveRecordSortsToViewSorts';

export const useSaveCurrentViewFiltersAndSorts = () => {
  const { saveRecordFilterGroupsToViewFilterGroups } =
    useSaveRecordFilterGroupsToViewFilterGroups();

  const { saveRecordFiltersToViewFilters } =
    useSaveRecordFiltersToViewFilters();

  const { saveRecordSortsToViewSorts } = useSaveRecordSortsToViewSorts();

  const saveCurrentViewFilterAndSorts = async () => {
    await saveRecordSortsToViewSorts();
    await saveRecordFiltersToViewFilters();
    await saveRecordFilterGroupsToViewFilterGroups();
  };

  return {
    saveCurrentViewFilterAndSorts,
  };
};
