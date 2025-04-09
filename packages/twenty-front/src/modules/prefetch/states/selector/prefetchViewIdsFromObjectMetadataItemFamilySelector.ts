import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { selectorFamily } from 'recoil';

export const prefetchViewIdsFromObjectMetadataItemFamilySelector =
  selectorFamily<string[], { objectMetadataItemId: string }>({
    key: 'prefetchViewIdsFromObjectMetadataItemFamilySelector',
    get:
      ({ objectMetadataItemId }) =>
      ({ get }) => {
        const views = get(prefetchViewsState);
        return views
          .filter((view) => view.objectMetadataId === objectMetadataItemId)
          .map((view) => view.id);
      },
  });
