import { objectMetadataItemsCurrentSelector } from '@/metadata-store/states/objectMetadataItemsCurrentSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const isSystemObjectByNameSingularFamilySelector =
  createAtomFamilySelector<boolean, string>({
    key: 'isSystemObjectByNameSingularFamilySelector',
    get:
      (nameSingular: string) =>
      ({ get }) => {
        const flatObjects = get(objectMetadataItemsCurrentSelector);

        return (
          flatObjects.find(
            (flatObject) => flatObject.nameSingular === nameSingular,
          )?.isSystem ?? false
        );
      },
  });
