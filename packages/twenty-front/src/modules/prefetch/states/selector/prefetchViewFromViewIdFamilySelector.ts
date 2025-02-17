import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { View } from '@/views/types/View';
import { selectorFamily } from 'recoil';

export const prefetchViewFromViewIdFamilySelector = selectorFamily<
  View | undefined,
  { viewId: string }
>({
  key: 'prefetchViewFromViewIdFamilySelector',
  get:
    ({ viewId }) =>
    ({ get }) => {
      const views = get(prefetchViewsState);
      return views?.find((view) => view.id === viewId);
    },
});
