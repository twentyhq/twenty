import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { selectorFamily } from 'recoil';

export const coreViewIdsFromObjectMetadataItemFamilySelector = selectorFamily<
  string[],
  { objectMetadataItemId: string }
>({
  key: 'coreViewIdsFromObjectMetadataItemFamilySelector',
  get:
    ({ objectMetadataItemId }) =>
    ({ get }) => {
      const coreViews = get(coreViewsState);

      const views = coreViews.map(convertCoreViewToView);

      return views
        .filter((view) => view.objectMetadataId === objectMetadataItemId)
        .map((view) => view.id);
    },
});
