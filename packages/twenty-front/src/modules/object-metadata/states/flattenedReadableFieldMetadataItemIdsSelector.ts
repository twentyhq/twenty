import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { selector } from 'recoil';

export const flattenedReadableFieldMetadataItemsSelector = selector<
  FieldMetadataItem[]
>({
  key: 'flattenedReadableFieldMetadataItemsSelector',
  get: ({ get }) => {
    const objectMetadataItems = get(objectMetadataItemsState);

    const flattenedReadableFieldMetadataItems = objectMetadataItems.flatMap(
      (objectMetadataItem) => objectMetadataItem.readableFields,
    );

    return flattenedReadableFieldMetadataItems;
  },
});
