import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { selector } from 'recoil';

export const prefetchViewLengthSelector = selector<number>({
  key: 'prefetchViewLengthSelector',
  get: ({ get }) => {
    const views = get(prefetchViewsState);
    return views?.length ?? 0;
  },
});
