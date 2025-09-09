import { coreViewsState } from '@/views/states/coreViewState';
import { selector } from 'recoil';

export const coreViewLengthFamilySelector = selector<number>({
  key: 'coreViewLengthFamilySelector',
  get: ({ get }) => {
    const coreViews = get(coreViewsState);

    return coreViews?.length ?? 0;
  },
});
