import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

type ObjectMetadataItemSelector = {
  objectName: string;
  objectNameType: 'singular' | 'plural';
};

export const objectMetadataItemFamilySelector = createAtomFamilySelector<
  ObjectMetadataItem | null,
  ObjectMetadataItemSelector
>({
  key: 'objectMetadataItemFamilySelector',
  get:
    ({ objectNameType, objectName }: ObjectMetadataItemSelector) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsWithFieldsSelector);

      if (objectNameType === 'singular') {
        return (
          objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.nameSingular === objectName,
          ) ?? null
        );
      } else if (objectNameType === 'plural') {
        return (
          objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.namePlural === objectName,
          ) ?? null
        );
      }
      return null;
    },
});
