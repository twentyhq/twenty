import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createSelector } from '@/ui/utilities/state/jotai/utils/createSelector';

export const flattenedFieldMetadataItemsSelector = createSelector<
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
