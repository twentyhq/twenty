import { coreViewsState } from '@/views/states/coreViewState';
import { createSelector } from '@/ui/utilities/state/jotai/utils/createSelector';

export const coreViewLengthFamilySelector = createSelector<number>({
  key: 'coreViewLengthFamilySelector',
  get: ({ get }) => {
    const coreViews = get(coreViewsState);
    return coreViews?.length ?? 0;
  },
});
