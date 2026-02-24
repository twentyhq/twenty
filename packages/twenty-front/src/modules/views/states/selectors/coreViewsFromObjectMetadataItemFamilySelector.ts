import { coreViewsState } from '@/views/states/coreViewState';
import { type View } from '@/views/types/View';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';

export const coreViewsFromObjectMetadataItemFamilySelector =
  createFamilySelectorV2<View[], { objectMetadataItemId: string }>({
    key: 'coreViewsFromObjectMetadataItemFamilySelector',
    get:
      ({ objectMetadataItemId }) =>
      ({ get }) => {
        const coreViews = get(coreViewsState);
        const views = coreViews.map(convertCoreViewToView);
        return views
          .filter((view) => view.objectMetadataId === objectMetadataItemId)
          .sort((a, b) => a.position - b.position);
      },
  });
