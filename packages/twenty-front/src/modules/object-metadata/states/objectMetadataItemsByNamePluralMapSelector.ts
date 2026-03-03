import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const objectMetadataItemsByNamePluralMapSelector = createAtomSelector<
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
