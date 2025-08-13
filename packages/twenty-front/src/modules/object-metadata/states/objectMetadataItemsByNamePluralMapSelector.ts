import { selector } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const objectMetadataItemsByNamePluralMapSelector = selector<
  Map<string, ObjectMetadataItem>
>({
  key: 'objectMetadataItemsByNamePluralMapSelector',
  get: ({ get }) => {
    const objectMetadataItems = get(objectMetadataItemsState);

    return new Map(
      objectMetadataItems.map((objectMetadataItem) => [
        objectMetadataItem.namePlural,
        objectMetadataItem,
      ]),
    );
  },
});
