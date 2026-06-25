import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const viewsByObjectMetadataIdFamilySelector = createAtomFamilySelector<
  ViewWithRelations[],
  string
>({
  key: 'viewsByObjectMetadataIdFamilySelector',
  get:
    (objectMetadataId) =>
    ({ get }) => {
      const views = get(viewsSelector);
      return views.filter((view) => view.objectMetadataId === objectMetadataId);
    },
});
