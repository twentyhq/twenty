import { useMemo } from 'react';
import { Nullable } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';

import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { formatFieldMetadataItemAsColumnDefinition } from '../utils/formatFieldMetadataItemAsColumnDefinition';
import { formatFieldMetadataItemsAsSortDefinitions } from '../utils/formatFieldMetadataItemsAsSortDefinitions';

export const useColumnDefinitionsFromFieldMetadata = (
  objectMetadataItem?: Nullable<ObjectMetadataItem>,
) => {
  const activeFieldMetadataItems = useMemo(
    () =>
      objectMetadataItem
        ? objectMetadataItem.fields.filter(
            ({ isActive, isSystem }) => isActive && !isSystem,
          )
        : [],
    [objectMetadataItem],
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
    fields: activeFieldMetadataItems,
  });

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] = useMemo(
    () =>
      objectMetadataItem
        ? activeFieldMetadataItems
            .map((field, index) =>
              formatFieldMetadataItemAsColumnDefinition({
                position: index,
                field,
                objectMetadataItem,
              }),
            )
            .filter(filterAvailableTableColumns)
            .map((column) => {
              const existsInFilterDefinitions =
                filterableFieldMetadataItems.some(
                  (fieldMetadataItem) =>
                    fieldMetadataItem.id === column.fieldMetadataId,
                );

              const existsInSortDefinitions = sortDefinitions.some(
                (sort) => sort.fieldMetadataId === column.fieldMetadataId,
              );

              return {
                ...column,
                isFilterable: existsInFilterDefinitions,
                isSortable: existsInSortDefinitions,
              };
            })
        : [],
    [
      filterableFieldMetadataItems,
      activeFieldMetadataItems,
      objectMetadataItem,
      sortDefinitions,
    ],
  );

  return {
    columnDefinitions,
    sortDefinitions,
  };
};
