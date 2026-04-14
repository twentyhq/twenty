import { useSaveAnyFieldFilterToView } from '@/views/hooks/useSaveAnyFieldFilterToView';
import { useSaveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters } from '@/views/hooks/useSaveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters';
import { useSaveRecordSortsToViewSorts } from '@/views/hooks/useSaveRecordSortsToViewSorts';

export const useSaveCurrentViewFiltersAndSorts = () => {
  const { saveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters } =
    useSaveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters();

  const { saveRecordSortsToViewSorts } = useSaveRecordSortsToViewSorts();

  const { saveAnyFieldFilterToView } = useSaveAnyFieldFilterToView();

  const saveCurrentViewFilterAndSorts = async () => {
    await saveRecordSortsToViewSorts();
    await saveRecordFiltersAndGroupFiltersToViewFiltersAndGroupFilters();
    await saveAnyFieldFilterToView();
  };

  return {
    saveCurrentViewFilterAndSorts,
  };
};
