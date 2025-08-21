import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { selector } from 'recoil';

export const prefetchViewLengthSelector = selector<number>({
  key: 'prefetchViewLengthSelector',
  get: ({ get }) => {
    const coreViews = get(coreViewsState);

    const views = coreViews.map(convertCoreViewToView);
    return views?.length ?? 0;
  },
});
