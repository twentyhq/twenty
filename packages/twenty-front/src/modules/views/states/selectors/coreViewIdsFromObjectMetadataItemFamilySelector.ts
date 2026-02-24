import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { createFamilySelector } from '@/ui/utilities/state/jotai/utils/createFamilySelector';

export const coreViewIdsFromObjectMetadataItemFamilySelector =
  createFamilySelector<string[], { objectMetadataItemId: string }>({
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
