import { SortDefinition } from '@/ui/data/sort/types/SortDefinition';

import { MetadataObject } from '../types/MetadataObject';

export const formatMetadataFieldAsSortDefinition = ({
  field,
  icons,
}: {
  field: MetadataObject['fields'][0];
  icons: Record<string, any>;
}): SortDefinition => ({
  fieldId: field.id,
  label: field.label,
  Icon: icons[field.icon ?? 'Icon123'],
});
