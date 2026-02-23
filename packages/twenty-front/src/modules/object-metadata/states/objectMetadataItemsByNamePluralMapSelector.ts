import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';

export const objectMetadataItemsByNamePluralMapSelector = createSelectorV2<
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
