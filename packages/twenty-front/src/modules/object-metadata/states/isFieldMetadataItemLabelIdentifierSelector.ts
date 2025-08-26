import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { selectorFamily } from 'recoil';
import { findById, isDefined } from 'twenty-shared/utils';

export const isFieldMetadataItemLabelIdentifierSelector = selectorFamily({
  key: 'isFieldMetadataItemLabelIdentifierSelector',
  get:
    ({ fieldMetadataItemId }: { fieldMetadataItemId: string }) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

      const foundObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.fields.some(findById(fieldMetadataItemId)),
      );

      if (!isDefined(foundObjectMetadataItem)) {
        return false;
      }

      const foundFieldMetadataItem = foundObjectMetadataItem.fields.find(
        findById(fieldMetadataItemId),
      );

      if (!isDefined(foundFieldMetadataItem)) {
        return false;
      }

      const fieldIsLabelIdentifier = isLabelIdentifierField({
        fieldMetadataItem: foundFieldMetadataItem,
        objectMetadataItem: foundObjectMetadataItem,
      });

      return fieldIsLabelIdentifier;
    },
});
