import { useSetRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useSetRecoilInstanceState';
import { unsavedToDeleteViewFilterIdsInstanceState } from '@/views/states/unsavedToDeleteViewFilterIdsInstanceState';
import { unsavedToDeleteViewSortIdsInstanceState } from '@/views/states/unsavedToDeleteViewSortIdsInstanceState';
import { unsavedToUpsertViewFiltersInstanceState } from '@/views/states/unsavedToUpsertViewFiltersInstanceState';
import { unsavedToUpsertViewSortsInstanceState } from '@/views/states/unsavedToUpsertViewSortsInstanceState';

export const useResetCurrentView = (viewBarInstanceId?: string) => {
  const setUnsavedToDeleteViewFilterIds = useSetRecoilInstanceState(
    unsavedToDeleteViewFilterIdsInstanceState,
    viewBarInstanceId,
  );

  const setUnsavedToDeleteViewSortIds = useSetRecoilInstanceState(
    unsavedToDeleteViewSortIdsInstanceState,
    viewBarInstanceId,
  );

  const setUnsavedToUpsertViewFilters = useSetRecoilInstanceState(
    unsavedToUpsertViewFiltersInstanceState,
    viewBarInstanceId,
  );

  const setUnsavedToUpsertViewSortsState = useSetRecoilInstanceState(
    unsavedToUpsertViewSortsInstanceState,
    viewBarInstanceId,
  );

  const resetCurrentView = () => {
    setUnsavedToDeleteViewFilterIds([]);
    setUnsavedToDeleteViewSortIds([]);
    setUnsavedToUpsertViewFilters([]);
    setUnsavedToUpsertViewSortsState([]);
  };

  return {
    resetCurrentView,
  };
};
