import { coreViewsState } from '@/views/states/coreViewState';
import { type View } from '@/views/types/View';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { selectorFamily } from 'recoil';

export const prefetchViewsFromObjectMetadataItemFamilySelector = selectorFamily<
  View[],
  { objectMetadataItemId: string }
>({
  key: 'prefetchViewsFromObjectMetadataItemFamilySelector',
  get:
    ({ objectMetadataItemId }) =>
    ({ get }) => {
      const coreViews = get(coreViewsState);

      const views = coreViews.map(convertCoreViewToView);

      const filteredViews = views.filter(
        (view) => view.objectMetadataId === objectMetadataItemId,
      );

      return filteredViews.sort((a, b) => a.position - b.position);
    },
});
