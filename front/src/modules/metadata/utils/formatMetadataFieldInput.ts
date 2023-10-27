import toCamelCase from 'lodash.camelcase';

import { MetadataFieldDataType } from '@/settings/data-model/types/ObjectFieldDataType';
import { Field } from '~/generated-metadata/graphql';

export const formatMetadataFieldInput = (
  input: Pick<Field, 'label' | 'icon' | 'description'> & {
    type: MetadataFieldDataType;
  },
) => ({
  description: input.description?.trim() ?? null,
  icon: input.icon,
  label: input.label.trim(),
  name: toCamelCase(input.label.trim()),
  type: input.type,
});
