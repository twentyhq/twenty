import { isFunction, isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

type AttributeLike = {
  name?: unknown;
};

const resolveStoredAttributeName = (attribute: unknown): string | null => {
  if (!isObject(attribute)) {
    return null;
  }

  const { name } = attribute as AttributeLike;

  return isString(name) ? name : null;
};

export const readElementAttributeIgnoringCase = (
  element: SelectorElementLike,
  attributeName: string,
): string | null => {
  if (!isFunction(element.getAttribute)) {
    return null;
  }

  const exactAttributeValue = element.getAttribute(attributeName);

  if (isDefined(exactAttributeValue)) {
    return exactAttributeValue;
  }

  const lowerCasedAttributeName = attributeName.toLowerCase();

  for (const attribute of element.attributes ?? []) {
    const storedAttributeName = resolveStoredAttributeName(attribute);

    if (
      isDefined(storedAttributeName) &&
      storedAttributeName.toLowerCase() === lowerCasedAttributeName
    ) {
      return element.getAttribute(storedAttributeName);
    }
  }

  return null;
};
