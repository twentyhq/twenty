import { isFunction, isString } from '@sniptt/guards';

import { type ElementWithClassAttribute } from '@/polyfills/dom/types/ElementWithClassAttribute';

export const resolveClassAttributeValue = (
  element: ElementWithClassAttribute,
): string | null => {
  if (isFunction(element.getAttribute)) {
    const classAttributeValue = element.getAttribute('class');

    if (isString(classAttributeValue)) {
      return classAttributeValue;
    }
  }

  return isString(element.className) ? element.className : null;
};
