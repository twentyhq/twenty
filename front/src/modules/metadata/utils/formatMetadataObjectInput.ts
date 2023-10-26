import toCamelCase from 'lodash.camelcase';
import upperFirst from 'lodash.upperfirst';

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
  namePlural: upperFirst(toCamelCase(input.labelPlural.trim())),
  nameSingular: upperFirst(toCamelCase(input.labelSingular.trim())),
});
