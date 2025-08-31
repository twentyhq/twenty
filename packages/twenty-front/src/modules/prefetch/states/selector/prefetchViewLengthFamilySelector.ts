import { coreViewsState } from '@/views/states/coreViewState';
import { selector } from 'recoil';

export const prefetchViewLengthSelector = selector<number>({
  key: 'prefetchViewLengthSelector',
  get: ({ get }) => {
    const coreViews = get(coreViewsState);

    return coreViews?.length ?? 0;
  },
});
