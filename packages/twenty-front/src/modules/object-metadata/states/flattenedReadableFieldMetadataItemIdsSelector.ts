import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const flattenedReadableFieldMetadataItemsSelector = createAtomSelector<
  FieldMetadataItem[]
>({
  key: 'flattenedReadableFieldMetadataItemsSelector',
  get: ({ get }) => {
    const objectMetadataItems = get(objectMetadataItemsState);

    return objectMetadataItems.flatMap(
      (objectMetadataItem) => objectMetadataItem.readableFields,
    );
  },
});
