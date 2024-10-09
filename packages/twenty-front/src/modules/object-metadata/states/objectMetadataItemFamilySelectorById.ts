import { selectorFamily } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type ObjectMetadataItemSelector = {
  objectId: string;
};

export const objectMetadataItemFamilySelectorById = selectorFamily<
  ObjectMetadataItem | null,
  ObjectMetadataItemSelector
>({
  key: 'objectMetadataItemFamilySelector',
  get:
    ({ objectId }: ObjectMetadataItemSelector) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

      return (
        objectMetadataItems.find(
          (objectMetadataItem) => objectMetadataItem.id === objectId,
        ) ?? null
      );
    },
});
