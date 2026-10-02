import { DATA_ATTRIBUTE_PREFIX } from '@/polyfills/dom/constants/DataAttributePrefix';

export const convertDataAttributeNameToDatasetProperty = (
  dataAttributeName: string,
): string =>
  dataAttributeName
    .slice(DATA_ATTRIBUTE_PREFIX.length)
    .replace(/-([a-z])/g, (_match, lowercaseLetter: string) =>
      lowercaseLetter.toUpperCase(),
    );
