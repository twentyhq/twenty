import { objectMetadataItemsSelector } from '@/metadata-store/states/objectMetadataItemsSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const isSystemObjectByNameSingularFamilySelector =
  createAtomFamilySelector<boolean, string>({
    key: 'isSystemObjectByNameSingularFamilySelector',
    get:
      (nameSingular: string) =>
      ({ get }) => {
        const flatObjects = get(objectMetadataItemsSelector);

        return (
          flatObjects.find(
            (flatObject) => flatObject.nameSingular === nameSingular,
          )?.isSystem ?? false
        );
      },
  });
