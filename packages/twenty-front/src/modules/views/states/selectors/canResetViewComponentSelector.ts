import { selectorFamily } from 'recoil';

import { unsavedToDeleteViewFilterIdsComponentState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentState';
import { unsavedToDeleteViewSortIdsComponentState } from '@/views/states/unsavedToDeleteViewSortIdsComponentState';
import { unsavedToUpsertViewFiltersComponentState } from '@/views/states/unsavedToUpsertViewFiltersComponentState';
import { unsavedToUpsertViewSortsComponentState } from '@/views/states/unsavedToUpsertViewSortsComponentState';

export const canResetViewComponentSelector = selectorFamily({
  key: 'canResetViewComponentSelector',
  get:
    ({ scopeId }: { scopeId: string }) =>
    ({ get }) => {
      return (
        get(unsavedToUpsertViewFiltersComponentState({ scopeId })).length ===
          0 &&
        get(unsavedToUpsertViewSortsComponentState({ scopeId })).length === 0 &&
        get(unsavedToDeleteViewFilterIdsComponentState({ scopeId })).length ===
          0 &&
        get(unsavedToDeleteViewSortIdsComponentState({ scopeId })).length === 0
      );
    },
});
