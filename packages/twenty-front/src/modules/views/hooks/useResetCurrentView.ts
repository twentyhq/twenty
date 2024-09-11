import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { unsavedToDeleteViewFilterIdsComponentState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentState';
import { unsavedToDeleteViewSortIdsComponentState } from '@/views/states/unsavedToDeleteViewSortIdsComponentState';
import { unsavedToUpsertViewFiltersComponentState } from '@/views/states/unsavedToUpsertViewFiltersComponentState';
import { unsavedToUpsertViewSortsComponentState } from '@/views/states/unsavedToUpsertViewSortsComponentState';

export const useResetCurrentView = (viewBarInstanceId?: string) => {
  const setUnsavedToDeleteViewFilterIds = useSetRecoilComponentStateV2(
    unsavedToDeleteViewFilterIdsComponentState,
    viewBarInstanceId,
  );

  const setUnsavedToDeleteViewSortIds = useSetRecoilComponentStateV2(
    unsavedToDeleteViewSortIdsComponentState,
    viewBarInstanceId,
  );

  const setUnsavedToUpsertViewFilters = useSetRecoilComponentStateV2(
    unsavedToUpsertViewFiltersComponentState,
    viewBarInstanceId,
  );

  const setUnsavedToUpsertViewSortsState = useSetRecoilComponentStateV2(
    unsavedToUpsertViewSortsComponentState,
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
