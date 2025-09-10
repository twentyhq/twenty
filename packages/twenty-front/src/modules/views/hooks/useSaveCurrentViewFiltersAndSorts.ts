import { useSaveAnyFieldFilterToView } from '@/views/hooks/useSaveAnyFieldFilterToView';
import { useSaveRecordFilterGroupsToViewFilterGroups } from '@/views/hooks/useSaveRecordFilterGroupsToViewFilterGroups';
import { useSaveRecordFiltersToViewFilters } from '@/views/hooks/useSaveRecordFiltersToViewFilters';
import { useSaveRecordSortsToViewSorts } from '@/views/hooks/useSaveRecordSortsToViewSorts';

export const useSaveCurrentViewFiltersAndSorts = () => {
  const { saveRecordFilterGroupsToViewFilterGroups } =
    useSaveRecordFilterGroupsToViewFilterGroups();

  const { saveRecordFiltersToViewFilters } =
    useSaveRecordFiltersToViewFilters();

  const { saveRecordSortsToViewSorts } = useSaveRecordSortsToViewSorts();

  const { saveAnyFieldFilterToView } = useSaveAnyFieldFilterToView();

  const saveCurrentViewFilterAndSorts = async () => {
    await saveRecordSortsToViewSorts();
    await saveRecordFilterGroupsToViewFilterGroups();
    await saveRecordFiltersToViewFilters();
    await saveAnyFieldFilterToView();
  };

  return {
    saveCurrentViewFilterAndSorts,
  };
};
