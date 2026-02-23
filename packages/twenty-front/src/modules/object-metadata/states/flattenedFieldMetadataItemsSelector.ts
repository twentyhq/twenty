import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';

export const flattenedFieldMetadataItemsSelector = createSelectorV2<
  FieldMetadataItem[]
>({
  key: 'flattenedFieldMetadataItemsSelector',
  get: ({ get }) => {
    const objectMetadataItems = get(objectMetadataItemsState);

    return objectMetadataItems.flatMap(
      (objectMetadataItem) => objectMetadataItem.fields,
    );
  },
});
