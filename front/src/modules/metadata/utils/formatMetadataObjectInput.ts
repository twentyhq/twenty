import toCamelCase from 'lodash.camelcase';

import { MetadataObject } from '../types/MetadataObject';

export const formatMetadataObjectInput = (
  input: Pick<
    MetadataObject,
    'labelPlural' | 'labelSingular' | 'icon' | 'description'
  >,
) => ({
  description: input.description?.trim() ?? null,
  icon: input.icon,
  labelPlural: input.labelPlural.trim(),
  labelSingular: input.labelSingular.trim(),
  namePlural: toCamelCase(input.labelPlural.trim()),
  nameSingular: toCamelCase(input.labelSingular.trim()),
});
