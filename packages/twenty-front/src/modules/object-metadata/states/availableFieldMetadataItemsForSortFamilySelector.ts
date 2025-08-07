import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { filterSortableFieldMetadataItems } from '@/object-metadata/utils/filterSortableFieldMetadataItems';
import { selectorFamily } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const availableFieldMetadataItemsForSortFamilySelector = selectorFamily({
  key: 'availableFieldMetadataItemsForSortFamilySelector',
  get:
    ({ objectMetadataItemId }: { objectMetadataItemId: string }) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === objectMetadataItemId,
      );

      if (!isDefined(objectMetadataItem)) {
        return [];
      }

      const availableFieldMetadataItemsForSort =
        objectMetadataItem.readableFields.filter(
          filterSortableFieldMetadataItems,
        );

      return availableFieldMetadataItemsForSort;
    },
});
