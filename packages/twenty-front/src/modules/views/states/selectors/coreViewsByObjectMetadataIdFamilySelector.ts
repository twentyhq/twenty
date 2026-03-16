import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { coreViewsSelector } from '@/views/states/selectors/coreViewsSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const coreViewsByObjectMetadataIdFamilySelector =
  createAtomFamilySelector<CoreViewWithRelations[], string>({
    key: 'coreViewsByObjectMetadataIdFamilySelector',
    get:
      (objectMetadataId) =>
      ({ get }) => {
        const coreViews = get(coreViewsSelector);
        return coreViews.filter(
          (view) => view.objectMetadataId === objectMetadataId,
        );
      },
  });
