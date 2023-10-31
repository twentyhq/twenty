import toKebabCase from 'lodash.kebabcase';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const getObjectSlug = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'labelPlural'>,
) => toKebabCase(objectMetadataItem.labelPlural);
