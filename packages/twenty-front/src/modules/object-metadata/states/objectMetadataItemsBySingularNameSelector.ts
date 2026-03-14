import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const objectMetadataItemsBySingularNameSelector =
  createAtomFamilySelector<ObjectMetadataItem[], string[]>({
    key: 'objectMetadataItemsSelector',
    get:
      (objectNameSingulars: string[]) =>
      ({ get }) => {
        const objectMetadataItems = get(objectMetadataItemsWithFieldsSelector);

        return objectNameSingulars.flatMap((objectNameSingular) => {
          const found = objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.nameSingular === objectNameSingular,
          );

          return found !== undefined ? [found] : [];
        });
      },
  });
