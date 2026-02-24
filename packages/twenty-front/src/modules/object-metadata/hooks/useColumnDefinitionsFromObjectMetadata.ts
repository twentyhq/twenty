import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';

import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useMemo } from 'react';

export const useColumnDefinitionsFromObjectMetadata = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  const filterableFieldMetadataItems = useFamilySelectorValueV2(
    availableFieldMetadataItemsForFilterFamilySelector,
    {
      objectMetadataItemId: objectMetadataItem.id,
    },
  );

  const sortableFieldMetadataItems = useFamilySelectorValueV2(
    availableFieldMetadataItemsForSortFamilySelector,
    {
      objectMetadataItemId: objectMetadataItem.id,
    },
  );

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] = useMemo(() => {
    const activeFieldMetadataItems =
      objectMetadataItem.readableFields.filter(
        (field) =>
          field.isActive &&
          (!isHiddenSystemField(field) ||
            field.id === objectMetadataItem.labelIdentifierFieldMetadataId),
      );

    return activeFieldMetadataItems
      .map((field, index) =>
        formatFieldMetadataItemAsColumnDefinition({
          position: index,
          field,
          objectMetadataItem,
        }),
      )
      .filter(filterAvailableTableColumns)
      .filter((column) => {
        const restrictedFieldMetadataIds: string[] = [];
        return !restrictedFieldMetadataIds.includes(column.fieldMetadataId);
      })
      .map((column) => {
        const existsInFilterDefinitions = filterableFieldMetadataItems.some(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === column.fieldMetadataId,
        );

        const existsInSortDefinitions = sortableFieldMetadataItems.some(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === column.fieldMetadataId,
        );
        return {
          ...column,
          isFilterable: existsInFilterDefinitions,
          isSortable: existsInSortDefinitions,
        };
      });
  }, [
    filterableFieldMetadataItems,
    sortableFieldMetadataItems,
    objectMetadataItem,
  ]);

  return {
    columnDefinitions,
  };
};
