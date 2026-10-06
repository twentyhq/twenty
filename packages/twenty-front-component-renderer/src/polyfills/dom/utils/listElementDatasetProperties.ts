import { type ElementWithAttributeNames } from '@/polyfills/dom/types/ElementWithAttributeNames';
import { convertDataAttributeNameToDatasetProperty } from '@/polyfills/dom/utils/convertDataAttributeNameToDatasetProperty';
import { isDatasetAttributeName } from '@/polyfills/dom/utils/isDatasetAttributeName';

export const listElementDatasetProperties = (
  element: ElementWithAttributeNames,
): string[] =>
  element
    .getAttributeNames()
    .filter(isDatasetAttributeName)
    .map(convertDataAttributeNameToDatasetProperty);
