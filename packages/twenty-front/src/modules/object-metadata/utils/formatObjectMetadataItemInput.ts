import toCamelCase from 'lodash.camelcase';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatObjectMetadataItemInput = (
  input: Pick<
    ObjectMetadataItem,
    | 'description'
    | 'icon'
    | 'labelIdentifierFieldMetadataId'
    | 'labelPlural'
    | 'labelSingular'
  >,
) => ({
  description: input.description?.trim() ?? null,
  icon: input.icon,
  labelIdentifierFieldMetadataId:
    input.labelIdentifierFieldMetadataId?.trim() ?? null,
  labelPlural: input.labelPlural.trim(),
  labelSingular: input.labelSingular.trim(),
  namePlural: toCamelCase(input.labelPlural.trim()),
  nameSingular: toCamelCase(input.labelSingular.trim()),
});
