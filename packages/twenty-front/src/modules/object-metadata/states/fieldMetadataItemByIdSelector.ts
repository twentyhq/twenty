import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { createFamilySelector } from '@/ui/utilities/state/jotai/utils/createFamilySelector';
import { findById, isDefined } from 'twenty-shared/utils';

export const fieldMetadataItemByIdSelector = createFamilySelector({
  key: 'fieldMetadataItemByIdSelector',
  get:
    ({ fieldMetadataItemId }: { fieldMetadataItemId: string }) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);
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
