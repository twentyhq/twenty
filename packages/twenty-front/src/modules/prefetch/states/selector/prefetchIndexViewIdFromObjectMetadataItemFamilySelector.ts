import { coreViewsState } from '@/views/states/coreViewState';
import { ViewKey } from '@/views/types/ViewKey';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { selectorFamily } from 'recoil';

export const prefetchIndexViewIdFromObjectMetadataItemFamilySelector =
  selectorFamily<string | undefined, { objectMetadataItemId: string }>({
    key: 'prefetchIndexViewIdFromObjectMetadataItemFamilySelector',
    get:
      ({ objectMetadataItemId }) =>
      ({ get }) => {
        const coreViews = get(coreViewsState);

        const views = coreViews.map(convertCoreViewToView);

        return views?.find(
          (view) =>
            view.objectMetadataId === objectMetadataItemId &&
            view.key === ViewKey.Index,
        )?.id;
      },
  });
