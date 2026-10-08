import { isString } from '@sniptt/guards';

import { type ElementWithAttributes } from '@/polyfills/dom/types/ElementWithAttributes';
import { convertDatasetPropertyToDataAttributeName } from '@/polyfills/dom/utils/convertDatasetPropertyToDataAttributeName';

type ReadElementDatasetValueInput = {
  element: ElementWithAttributes;
  property: string | symbol;
};

export const readElementDatasetValue = ({
  element,
  property,
}: ReadElementDatasetValueInput): string | undefined => {
  if (!isString(property)) {
    return undefined;
  }

  return (
    element.getAttribute(convertDatasetPropertyToDataAttributeName(property)) ??
    undefined
  );
};
