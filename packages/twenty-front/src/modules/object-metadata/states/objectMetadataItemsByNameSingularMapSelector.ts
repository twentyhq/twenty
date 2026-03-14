import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const objectMetadataItemsByNameSingularMapSelector = createAtomSelector<
  Map<string, ObjectMetadataItem>
>({
  key: 'objectMetadataItemsByNameSingularMapSelector',
  get: ({ get }) => {
    const objectMetadataItems = get(objectMetadataItemsWithFieldsSelector);

    return new Map(
      objectMetadataItems.map((objectMetadataItem) => [
        objectMetadataItem.nameSingular,
        objectMetadataItem,
      ]),
    );
  },
});
