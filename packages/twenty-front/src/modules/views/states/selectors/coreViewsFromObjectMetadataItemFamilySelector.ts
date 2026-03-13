import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { coreViewsState } from '@/views/states/coreViewState';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

export const coreViewsFromObjectMetadataItemFamilySelector =
  createAtomFamilySelector<View[], { objectMetadataItemId: string }>({
    key: 'coreViewsFromObjectMetadataItemFamilySelector',
    get:
      ({ objectMetadataItemId }) =>
      ({ get }) => {
        const coreViews = get(coreViewsState);
        const views = coreViews.map(convertCoreViewToView);
        return views
          .filter(
            (view) =>
              view.objectMetadataId === objectMetadataItemId &&
              view.type !== ViewType.FieldsWidget,
          )
          .sort((a, b) => a.position - b.position);
      },
  });
