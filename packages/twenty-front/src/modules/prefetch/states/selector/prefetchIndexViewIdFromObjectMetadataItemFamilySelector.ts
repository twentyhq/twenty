import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { ViewKey } from '@/views/types/ViewKey';
import { selectorFamily } from 'recoil';

export const prefetchIndexViewIdFromObjectMetadataItemFamilySelector =
  selectorFamily<string | undefined, { objectMetadataItemId: string }>({
    key: 'prefetchIndexViewIdFromObjectMetadataItemFamilySelector',
    get:
      ({ objectMetadataItemId }) =>
      ({ get }) => {
        const views = get(prefetchViewsState);
        return views?.find(
          (view) =>
            view.objectMetadataId === objectMetadataItemId &&
            view.key === ViewKey.Index,
        )?.id;
      },
  });
