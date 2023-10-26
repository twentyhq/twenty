import toKebabCase from 'lodash.kebabcase';

import { MetadataObject } from '../types/MetadataObject';

export const getObjectSlug = (
  metadataObject: Pick<MetadataObject, 'labelPlural'>,
) => toKebabCase(metadataObject.labelPlural);
