import { DATA_ATTRIBUTE_PREFIX } from '@/polyfills/dom/constants/DataAttributePrefix';

export const convertDatasetPropertyToDataAttributeName = (
  datasetProperty: string,
): string =>
  `${DATA_ATTRIBUTE_PREFIX}${datasetProperty.replace(
    /[A-Z]/g,
    (uppercaseLetter) => `-${uppercaseLetter.toLowerCase()}`,
  )}`;
