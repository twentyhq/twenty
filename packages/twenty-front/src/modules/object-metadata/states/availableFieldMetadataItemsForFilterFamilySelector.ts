import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';
import { selectorFamily } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const availableFieldMetadataItemsForFilterFamilySelector =
  selectorFamily({
    key: 'availableFieldMetadataItemsForFilterFamilySelector',
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

        const filterFilterableFieldMetadataItems =
          getFilterFilterableFieldMetadataItems();

        const availableFieldMetadataItemsForFilter =
          objectMetadataItem.fields.filter(filterFilterableFieldMetadataItems);

        return availableFieldMetadataItemsForFilter;
      },
  });
