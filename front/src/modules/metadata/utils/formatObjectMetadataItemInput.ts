import toCamelCase from 'lodash.camelcase';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatObjectMetadataItemInput = (
  input: Pick<
    ObjectMetadataItem,
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
