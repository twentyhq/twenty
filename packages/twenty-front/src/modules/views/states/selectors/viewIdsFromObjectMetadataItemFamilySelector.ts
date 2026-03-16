import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const viewIdsFromObjectMetadataItemFamilySelector =
  createAtomFamilySelector<string[], { objectMetadataItemId: string }>({
    key: 'viewIdsFromObjectMetadataItemFamilySelector',
    get:
      ({ objectMetadataItemId }) =>
      ({ get }) => {
        const views = get(viewsSelector);
        return views
          .filter((view) => view.objectMetadataId === objectMetadataItemId)
          .map((view) => view.id);
      },
  });
