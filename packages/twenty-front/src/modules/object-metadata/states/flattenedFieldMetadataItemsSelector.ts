import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const flattenedFieldMetadataItemsSelector = createAtomSelector<
  FieldMetadataItem[]
>({
  key: 'flattenedFieldMetadataItemsSelector',
  get: ({ get }) => {
    const objectMetadataItems = get(objectMetadataItemsWithFieldsSelector);

    return objectMetadataItems.flatMap(
      (objectMetadataItem) => objectMetadataItem.fields,
    );
  },
});
