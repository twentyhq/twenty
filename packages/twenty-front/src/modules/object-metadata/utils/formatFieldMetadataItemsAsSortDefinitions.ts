import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';

import { SORTABLE_FIELD_METADATA_TYPES } from '@/object-metadata/constants/SortableFieldMetadataTypes';
import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatFieldMetadataItemsAsSortDefinitions = ({
  fields,
}: {
  fields: Array<ObjectMetadataItem['fields'][0]>;
}): SortDefinition[] =>
  fields.reduce((acc, field) => {
    if (!SORTABLE_FIELD_METADATA_TYPES.includes(field.type)) {
      return acc;
    }

    return [
      ...acc,
      {
        fieldMetadataId: field.id,
        label: field.label,
        iconName: field.icon ?? 'Icon123',
      },
    ];
  }, [] as SortDefinition[]);
