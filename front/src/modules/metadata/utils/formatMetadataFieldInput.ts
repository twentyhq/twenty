import toCamelCase from 'lodash.camelcase';

import { Field } from '~/generated-metadata/graphql';

export const formatMetadataFieldInput = (
  input: Pick<Field, 'label' | 'icon' | 'description'>,
) => ({
  description: input.description?.trim() ?? null,
  icon: input.icon,
  label: input.label.trim(),
  name: toCamelCase(input.label.trim()),
});
