import { flatObjectMetadataItemsSelector } from '@/object-metadata/states/flatObjectMetadataItemsSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const isSystemObjectByNameSingularFamilySelector =
  createAtomFamilySelector<boolean, string>({
    key: 'isSystemObjectByNameSingularFamilySelector',
    get:
      (nameSingular: string) =>
      ({ get }) => {
        const flatObjects = get(flatObjectMetadataItemsSelector);

        return (
          flatObjects.find(
            (flatObject) => flatObject.nameSingular === nameSingular,
          )?.isSystem ?? false
        );
      },
  });
