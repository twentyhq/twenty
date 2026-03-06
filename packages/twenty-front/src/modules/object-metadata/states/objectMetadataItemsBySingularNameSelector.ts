import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const objectMetadataItemsBySingularNameSelector =
  createAtomFamilySelector<ObjectMetadataItem[], string[]>({
    key: 'objectMetadataItemsSelector',
    get:
      (objectNameSingulars: string[]) =>
      ({ get }) => {
        const objectMetadataItems = get(objectMetadataItemsState);

        return objectNameSingulars.flatMap((objectNameSingular) => {
          const found = objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.nameSingular === objectNameSingular,
          );

          return found !== undefined ? [found] : [];
        });
      },
  });
