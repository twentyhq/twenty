import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createSelector } from '@/ui/utilities/state/jotai/utils/createSelector';

export const objectMetadataItemsByNamePluralMapSelector = createSelector<
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
