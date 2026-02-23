import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';

export const flattenedReadableFieldMetadataItemsSelector = createSelectorV2<
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
