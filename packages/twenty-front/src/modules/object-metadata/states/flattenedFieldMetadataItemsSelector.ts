import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { selector } from 'recoil';

export const flattenedFieldMetadataItemsSelector = selector<
  FieldMetadataItem[]
>({
  key: 'flattenedFieldMetadataItemsSelector',
  get: ({ get }) => {
    const objectMetadataItems = get(objectMetadataItemsState);

    const flattenedFieldMetadataItems = objectMetadataItems.flatMap(
      (objectMetadataItem) => objectMetadataItem.fields,
    );

    return flattenedFieldMetadataItems;
  },
});
