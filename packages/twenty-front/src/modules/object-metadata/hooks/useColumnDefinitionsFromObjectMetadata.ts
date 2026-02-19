import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';

import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { useRecoilValue } from 'recoil';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';

export const useColumnDefinitionsFromObjectMetadata = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  const activeFieldMetadataItems = objectMetadataItem.readableFields.filter(
    (field) =>
      field.isActive &&
      // Allow label identifier field (e.g. id for junction tables) even if it's a hidden system field
      (!isHiddenSystemField(field) ||
        field.id === objectMetadataItem.labelIdentifierFieldMetadataId),
  );

  const filterableFieldMetadataItems = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const sortableFieldMetadataItems = useRecoilValue(
    availableFieldMetadataItemsForSortFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const restrictedFieldMetadataIds: string[] = [];

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
    activeFieldMetadataItems
      .map((field, index) =>
        formatFieldMetadataItemAsColumnDefinition({
          position: index,
          field,
          objectMetadataItem,
        }),
      )
      .filter(filterAvailableTableColumns)
      .filter((column) => {
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

  return {
    columnDefinitions,
  };
};
