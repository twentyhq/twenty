import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { selectorFamily } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const labelIdentifierFieldMetadataItemSelector = selectorFamily({
  key: 'labelIdentifierFieldMetadataItemSelector',
  get:
    ({ objectMetadataItemId }: { objectMetadataItemId: string }) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) => objectMetadataItem.id === objectMetadataItemId,
      );

      if (!isDefined(objectMetadataItem)) {
        return undefined;
      }

      const labelIdentifierFieldMetadataItem = objectMetadataItem.fields.find(
        (fieldMetadataItemToFind) =>
          isLabelIdentifierField({
            fieldMetadataItem: fieldMetadataItemToFind,
            objectMetadataItem: objectMetadataItem,
          }),
      );

      return labelIdentifierFieldMetadataItem;
    },
});
