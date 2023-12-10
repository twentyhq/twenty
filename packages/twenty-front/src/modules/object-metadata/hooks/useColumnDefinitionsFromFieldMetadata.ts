import { useMemo } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { Nullable } from '~/types/Nullable';

import { formatFieldMetadataItemAsColumnDefinition } from '../utils/formatFieldMetadataItemAsColumnDefinition';
import { formatFieldMetadataItemsAsFilterDefinitions } from '../utils/formatFieldMetadataItemsAsFilterDefinitions';
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

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] = useMemo(
    () =>
      objectMetadataItem
        ? activeFieldMetadataItems.map((field, index) =>
            formatFieldMetadataItemAsColumnDefinition({
              position: index,
              field,
              objectMetadataItem,
            }),
          )
        : [],
    [activeFieldMetadataItems, objectMetadataItem],
  );

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
