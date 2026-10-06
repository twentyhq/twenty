import { kebabToCamelCase } from 'twenty-shared/utils';

import { DATA_ATTRIBUTE_PREFIX } from '@/polyfills/dom/constants/DataAttributePrefix';

export const convertDataAttributeNameToDatasetProperty = (
  dataAttributeName: string,
): string =>
  kebabToCamelCase(dataAttributeName.slice(DATA_ATTRIBUTE_PREFIX.length));
