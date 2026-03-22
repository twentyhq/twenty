import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';

export const viewsFromObjectMetadataItemFamilySelector =
  createAtomFamilySelector<View[], { objectMetadataItemId: string }>({
    key: 'viewsFromObjectMetadataItemFamilySelector',
    get:
      ({ objectMetadataItemId }) =>
      ({ get }) => {
        const views = get(viewsSelector);
        return views
          .filter(
            (view) =>
              view.objectMetadataId === objectMetadataItemId &&
              view.type !== ViewType.FIELDS_WIDGET,
          )
          .sort((a, b) => a.position - b.position);
      },
  });
