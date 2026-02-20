import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { filterSortableFieldMetadataItems } from '@/object-metadata/utils/filterSortableFieldMetadataItems';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';
import { isDefined } from 'twenty-shared/utils';

export const availableFieldMetadataItemsForSortFamilySelector =
  createFamilySelectorV2<FieldMetadataItem[], { objectMetadataItemId: string }>(
    {
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
    },
  );
