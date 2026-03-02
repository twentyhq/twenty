import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const objectMetadataItemsBySingularNameSelector =
  createAtomFamilySelector<ObjectMetadataItem[], string[]>({
    key: 'objectMetadataItemsSelector',
    get:
      (objectNameSingulars: string[]) =>
      ({ get }) => {
        const objectMetadataItems = get(objectMetadataItemsState);

        return objectNameSingulars
          .map(
            (objectNameSingular) =>
              objectMetadataItems.find(
                (objectMetadataItem) =>
                  objectMetadataItem.nameSingular === objectNameSingular,
              ) ?? null,
          )
          .filter(isDefined);
      },
  });
