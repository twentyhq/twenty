import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const fieldMetadataItemByIdMapSelector = createAtomSelector<
  Map<string, FieldMetadataItem>
>({
  key: 'fieldMetadataItemByIdMapSelector',
  get: ({ get }) =>
    new Map(
      get(flattenedFieldMetadataItemsSelector).map((field) => [
        field.id,
        field,
      ]),
    ),
});
