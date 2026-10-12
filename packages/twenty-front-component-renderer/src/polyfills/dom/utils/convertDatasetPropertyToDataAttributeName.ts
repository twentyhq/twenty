import { camelToKebab } from 'twenty-shared/utils';

import { DATA_ATTRIBUTE_PREFIX } from '@/polyfills/dom/constants/DataAttributePrefix';

export const convertDatasetPropertyToDataAttributeName = (
  datasetProperty: string,
): string => `${DATA_ATTRIBUTE_PREFIX}${camelToKebab(datasetProperty)}`;
