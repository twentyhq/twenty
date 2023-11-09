import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatMetadataFieldAsFilterDefinition = ({
  field,
  icons,
}: {
  field: ObjectMetadataItem['fields'][0];
  icons: Record<string, any>;
}): FilterDefinition => ({
  fieldMetadataId: field.id,
  label: field.label,
  Icon: icons[field.icon ?? 'Icon123'],
  type: 'TEXT',
});
