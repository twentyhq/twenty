import toKebabCase from 'lodash.kebabcase';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const getObjectSlug = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'namePlural'>,
) => toKebabCase(objectMetadataItem.namePlural);
