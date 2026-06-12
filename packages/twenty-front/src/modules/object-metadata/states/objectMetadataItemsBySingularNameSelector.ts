import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const objectMetadataItemsBySingularNameSelector =
  createAtomFamilySelector<EnrichedObjectMetadataItem[], string[]>({
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
