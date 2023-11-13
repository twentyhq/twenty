import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatFieldMetadataItemAsFilterDefinition = ({
  field,
  icons,
}: {
  field: ObjectMetadataItem['fields'][0];
  icons: Record<string, any>;
}): FilterDefinition => ({
  fieldMetadataId: field.id,
  label: field.label,
  Icon: icons[field.icon ?? 'Icon123'],
  type:
    field.type === FieldMetadataType.Date
      ? 'DATE'
      : field.type === FieldMetadataType.Number
      ? 'NUMBER'
      : 'TEXT',
});
