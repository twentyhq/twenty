import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { filterSortableFieldMetadataItems } from '@/object-metadata/utils/filterSortableFieldMetadataItems';
import { createFamilySelector } from '@/ui/utilities/state/jotai/utils/createFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const availableFieldMetadataItemsForSortFamilySelector =
  createFamilySelector<FieldMetadataItem[], { objectMetadataItemId: string }>({
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

        return objectMetadataItem.readableFields.filter(
          filterSortableFieldMetadataItems,
        );
      },
  });
