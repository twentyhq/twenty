import { coreViewsState } from '@/views/states/coreViewState';
import { ViewKey } from '@/views/types/ViewKey';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';

export const coreIndexViewIdFromObjectMetadataItemFamilySelector =
  createFamilySelectorV2<string | undefined, { objectMetadataItemId: string }>({
    key: 'coreIndexViewIdFromObjectMetadataItemFamilySelector',
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
