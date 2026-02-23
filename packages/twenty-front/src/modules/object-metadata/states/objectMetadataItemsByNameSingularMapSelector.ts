import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';

export const objectMetadataItemsByNameSingularMapSelector = createSelectorV2<
  Map<string, ObjectMetadataItem>
>({
  key: 'objectMetadataItemsByNameSingularMapSelector',
  get: ({ get }) => {
    const objectMetadataItems = get(objectMetadataItemsState);

    return new Map(
      objectMetadataItems.map((objectMetadataItem) => [
        objectMetadataItem.nameSingular,
        objectMetadataItem,
      ]),
    );
  },
});
