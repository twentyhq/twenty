import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const findFieldMetadataItemByIdSelector = createAtomSelector<
  (id: string) => FieldMetadataItem | undefined
>({
  key: 'findFieldMetadataItemByIdSelector',
  get: ({ get }) => {
    const fieldMetadataItems = get(flattenedFieldMetadataItemsSelector);
    const fieldMetadataItemById = new Map(
      fieldMetadataItems.map((field) => [field.id, field]),
    );

    return (id) => fieldMetadataItemById.get(id);
  },
});
