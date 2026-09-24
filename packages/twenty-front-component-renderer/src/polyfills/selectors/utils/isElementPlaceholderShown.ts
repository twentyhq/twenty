import { isNonEmptyString, isString } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const TAG_NAMES_WITH_PLACEHOLDER = new Set(['input', 'textarea']);

export const isElementPlaceholderShown = (
  element: SelectorElementLike,
): boolean => {
  if (!TAG_NAMES_WITH_PLACEHOLDER.has(resolveHtmlTagNameOfElement(element))) {
    return false;
  }

  const placeholder = readElementAttributeIgnoringCase(element, 'placeholder');

  if (!isNonEmptyString(placeholder)) {
    return false;
  }

  const value = isString(element.value)
    ? element.value
    : readElementAttributeIgnoringCase(element, 'value');

  return !isNonEmptyString(value);
};
