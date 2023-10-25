import toCamelCase from 'lodash.camelcase';
import upperFirst from 'lodash.upperfirst';

import { ObjectFieldDataType } from '@/settings/data-model/types/ObjectFieldDataType';
import { Field } from '~/generated-metadata/graphql';

export const formatMetadataFieldInput = (
  input: Pick<Field, 'label' | 'icon' | 'description'> & {
    type: ObjectFieldDataType;
  },
) => ({
  description: input.description?.trim() ?? null,
  icon: input.icon,
  label: input.label.trim(),
  name: upperFirst(toCamelCase(input.label.trim())),
  type: input.type,
});
