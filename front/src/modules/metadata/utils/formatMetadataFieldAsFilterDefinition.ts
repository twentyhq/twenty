import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';

import { MetadataObject } from '../types/MetadataObject';

export const formatMetadataFieldAsFilterDefinition = ({
  field,
  icons,
}: {
  field: MetadataObject['fields'][0];
  icons: Record<string, any>;
}): FilterDefinition => ({
  fieldId: field.id,
  label: field.label,
  Icon: icons[field.icon ?? 'Icon123'],
  type: 'text',
});
