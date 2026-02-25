import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const coreViewIdsFromObjectMetadataItemFamilySelector =
  createAtomFamilySelector<string[], { objectMetadataItemId: string }>({
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
