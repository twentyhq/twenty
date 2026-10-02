import { DATA_ATTRIBUTE_PREFIX } from '@/polyfills/dom/constants/DataAttributePrefix';

export const isDatasetAttributeName = (attributeName: string): boolean =>
  attributeName.startsWith(DATA_ATTRIBUTE_PREFIX) &&
  !/[A-Z]/.test(attributeName.slice(DATA_ATTRIBUTE_PREFIX.length));
