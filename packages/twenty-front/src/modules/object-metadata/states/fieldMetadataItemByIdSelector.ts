import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { findById, isDefined } from 'twenty-shared/utils';

export const fieldMetadataItemByIdSelector = createAtomFamilySelector({
  key: 'fieldMetadataItemByIdSelector',
  get:
    ({ fieldMetadataItemId }: { fieldMetadataItemId: string }) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsWithFieldsSelector);
      const flattenedFieldMetadataItems = get(
        flattenedFieldMetadataItemsSelector,
      );

      const foundObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.fields.some(findById(fieldMetadataItemId)),
      );

      if (!isDefined(foundObjectMetadataItem)) {
        return {};
      }

      const foundFieldMetadataItem = flattenedFieldMetadataItems.find(
        findById(fieldMetadataItemId),
      );

      if (!isDefined(foundFieldMetadataItem)) {
        return {};
      }

      return {
        foundFieldMetadataItem,
        foundObjectMetadataItem,
      };
    },
});
