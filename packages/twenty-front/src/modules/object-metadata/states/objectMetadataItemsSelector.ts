import { selectorFamily } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const objectMetadataItemsSelector = selectorFamily<
  (ObjectMetadataItem | null)[],
  string[]
>({
  key: 'objectMetadataItemsSelector',
  get:
    (objectNameSingulars: string[]) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

      return objectNameSingulars.map(
        (objectNameSingular) =>
          objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.nameSingular === objectNameSingular,
          ) ?? null,
      );
    },
});
