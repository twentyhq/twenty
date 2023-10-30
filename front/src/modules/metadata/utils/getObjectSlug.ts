import toKebabCase from 'lodash.kebabcase';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const getObjectSlug = (
  ObjectMetadataItem: Pick<ObjectMetadataItem, 'labelPlural'>,
) => toKebabCase(ObjectMetadataItem.labelPlural);
