import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatMetadataFieldAsSortDefinition = ({
  field,
  icons,
}: {
  field: ObjectMetadataItem['fields'][0];
  icons: Record<string, any>;
}): SortDefinition => ({
  fieldMetadataId: field.id,
  label: field.label,
  Icon: icons[field.icon ?? 'Icon123'],
});
