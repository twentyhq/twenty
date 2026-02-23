import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';

type ObjectMetadataItemSelector = {
  objectName: string;
  objectNameType: 'singular' | 'plural';
};

export const objectMetadataItemFamilySelector = createFamilySelectorV2<
  ObjectMetadataItem | null,
  ObjectMetadataItemSelector
>({
  key: 'objectMetadataItemFamilySelector',
  get:
    ({ objectNameType, objectName }: ObjectMetadataItemSelector) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

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
