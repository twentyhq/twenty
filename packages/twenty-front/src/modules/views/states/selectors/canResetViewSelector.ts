import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { selectorFamily } from 'recoil';

export const canResetViewSelector = selectorFamily({
  key: 'canResetViewSelector',
  get:
    ({ viewId }: { viewId: string }) =>
    ({ get }) => {
      return (
        get(unsavedToUpsertViewFiltersComponentFamilyState(viewId)).length ===
          0 &&
        get(unsavedToUpsertViewFiltersComponentFamilyState(viewId)).length ===
          0 &&
        get(unsavedToUpsertViewFiltersComponentFamilyState(viewId)).length ===
          0 &&
        get(unsavedToUpsertViewFiltersComponentFamilyState(viewId)).length === 0
      );
    },
  instanceContext: ViewComponentInstanceContext,
});
