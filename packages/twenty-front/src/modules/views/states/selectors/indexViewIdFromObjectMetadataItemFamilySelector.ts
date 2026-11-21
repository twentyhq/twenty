import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { viewSummariesSelector } from '@/views/states/selectors/viewSummariesSelector';
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
        const views = get(viewSummariesSelector);
        return views?.find(
          (view) =>
            view.objectMetadataId === objectMetadataItemId &&
            view.key === ViewKey.INDEX,
        )?.id;
      },
  });
