import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { ViewKey } from '@/views/types/ViewKey';

export const indexViewIdFromObjectMetadataItemFamilySelector =
  createAtomFamilySelector<
    string | undefined,
    { objectMetadataItemId: string }
  >({
    key: 'indexViewIdFromObjectMetadataItemFamilySelector',
    get:
      ({ objectMetadataItemId }) =>
      ({ get }) => {
        const views = get(viewsSelector);
        return views?.find(
          (view) =>
            view.objectMetadataId === objectMetadataItemId &&
            view.key === ViewKey.INDEX,
        )?.id;
      },
  });
