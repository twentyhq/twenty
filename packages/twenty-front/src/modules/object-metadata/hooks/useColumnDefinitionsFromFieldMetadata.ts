import { useMemo } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { ViewType } from '@/views/types/ViewType';
import { Nullable } from '~/types/Nullable';

import { formatFieldMetadataItemAsColumnDefinition } from '../utils/formatFieldMetadataItemAsColumnDefinition';
import { formatFieldMetadataItemsAsFilterDefinitions } from '../utils/formatFieldMetadataItemsAsFilterDefinitions';
import { formatFieldMetadataItemsAsSortDefinitions } from '../utils/formatFieldMetadataItemsAsSortDefinitions';

export const useColumnDefinitionsFromFieldMetadata = (
  objectMetadataItem?: Nullable<ObjectMetadataItem>,
  viewType: ViewType = ViewType.Table,
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

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] = useMemo(() => {
    if (!objectMetadataItem) return [];

    const columnDefinitionsFromFieldMetadata = activeFieldMetadataItems.map(
      (field, index) =>
        formatFieldMetadataItemAsColumnDefinition({
          position: index,
          field,
          objectMetadataItem,
        }),
    );

    return viewType === ViewType.Kanban
      ? columnDefinitionsFromFieldMetadata.filter(
          (columnDefinition) =>
            filterAvailableTableColumns(columnDefinition) &&
            !isLabelIdentifierField({
              fieldMetadataItem: {
                id: columnDefinition.fieldMetadataId,
                name: columnDefinition.metadata.fieldName,
              },
              objectMetadataItem,
            }),
        )
      : columnDefinitionsFromFieldMetadata;
  }, [activeFieldMetadataItems, objectMetadataItem, viewType]);

  const filterDefinitions = formatFieldMetadataItemsAsFilterDefinitions({
    fields: activeFieldMetadataItems,
  });

  const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
    fields: activeFieldMetadataItems,
  });

  return {
    columnDefinitions,
    filterDefinitions,
    sortDefinitions,
  };
};
