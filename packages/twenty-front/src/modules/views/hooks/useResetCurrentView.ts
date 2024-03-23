import { useRecoilCallback } from 'recoil';

import { useViewStates } from '@/views/hooks/internal/useViewStates';

export const useResetCurrentView = (viewBarComponentId?: string) => {
  const {
    unsavedToDeleteViewSortIdsState,
    unsavedToUpsertViewSortsState,
    unsavedToDeleteViewFilterIdsState,
    unsavedToUpsertViewFiltersState,
  } = useViewStates(viewBarComponentId);

  const resetCurrentView = useRecoilCallback(
    ({ set }) =>
      async () => {
        set(unsavedToDeleteViewFilterIdsState, []);
        set(unsavedToDeleteViewSortIdsState, []);
        set(unsavedToUpsertViewFiltersState, []);
        set(unsavedToUpsertViewSortsState, []);
      },
    [
      unsavedToDeleteViewFilterIdsState,
      unsavedToDeleteViewSortIdsState,
      unsavedToUpsertViewFiltersState,
      unsavedToUpsertViewSortsState,
    ],
  );

  return {
    resetCurrentView,
  };
};
