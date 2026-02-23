import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';
import { findById, isDefined } from 'twenty-shared/utils';

export const isFieldMetadataItemFilterableAndSortableSelector =
  createFamilySelectorV2({
    key: 'isFieldMetadataItemFilterableAndSortableSelector',
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
          return {
            isFilterable: false,
            isSortable: false,
          };
        }

        const foundFieldMetadataItem = flattenedFieldMetadataItems.find(
          findById(fieldMetadataItemId),
        );

        if (!isDefined(foundFieldMetadataItem)) {
          return {
            isFilterable: false,
            isSortable: false,
          };
        }

        const filterableFieldMetadataItems = get(
          availableFieldMetadataItemsForFilterFamilySelector,
          { objectMetadataItemId: foundObjectMetadataItem.id },
        );

        const sortableFieldMetadataItems = get(
          availableFieldMetadataItemsForSortFamilySelector,
          { objectMetadataItemId: foundObjectMetadataItem.id },
        );

        const isFilterable = filterableFieldMetadataItems.some(
          findById(fieldMetadataItemId),
        );

        const isSortable = sortableFieldMetadataItems.some(
          findById(fieldMetadataItemId),
        );

        return {
          isFilterable,
          isSortable,
        };
      },
  });
