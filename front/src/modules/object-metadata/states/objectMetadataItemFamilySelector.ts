import { selectorFamily } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const objectMetadataItemFamilySelector = selectorFamily<
  ObjectMetadataItem | null,
  { objectNameSingular?: string; objectNamePlural?: string }
>({
  key: 'objectMetadataItemFamilySelector',
  get:
    ({
      objectNameSingular,
      objectNamePlural,
    }: {
      objectNameSingular?: string;
      objectNamePlural?: string;
    }) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);
      return (
        objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular === objectNameSingular ||
            objectMetadataItem.namePlural === objectNamePlural,
        ) ?? null
      );
    },
});
