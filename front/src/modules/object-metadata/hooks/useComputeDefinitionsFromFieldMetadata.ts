import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { Nullable } from '~/types/Nullable';

import { formatFieldMetadataItemAsColumnDefinition } from '../utils/formatFieldMetadataItemAsColumnDefinition';
import { formatFieldMetadataItemsAsFilterDefinitions } from '../utils/formatFieldMetadataItemsAsFilterDefinitions';
import { formatFieldMetadataItemsAsSortDefinitions } from '../utils/formatFieldMetadataItemsAsSortDefinitions';

export const useComputeDefinitionsFromFieldMetadata = (
  objectMetadataItem?: Nullable<ObjectMetadataItem>,
) => {
  if (!objectMetadataItem) {
    return {
      columnDefinitions: [],
      filterDefinitions: [],
      sortDefinitions: [],
    };
  }

  const activeFieldMetadataItems = objectMetadataItem.fields.filter(
    ({ isActive }) => isActive,
  );

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
    activeFieldMetadataItems.map((field, index) =>
      formatFieldMetadataItemAsColumnDefinition({
        position: index,
        field,
      }),
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
