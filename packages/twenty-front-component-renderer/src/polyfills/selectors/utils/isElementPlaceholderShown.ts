import { isNonEmptyString, isString } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

const TAG_NAMES_WITH_PLACEHOLDER = new Set(['input', 'textarea']);

const INPUT_TYPES_WITHOUT_PLACEHOLDER = new Set([
  'button',
  'checkbox',
  'color',
  'date',
  'datetime-local',
  'file',
  'hidden',
  'image',
  'month',
  'radio',
  'range',
  'reset',
  'submit',
  'time',
  'week',
]);

export const isElementPlaceholderShown = (
  element: SelectorElementLike,
): boolean => {
  const tagName = resolveHtmlTagNameOfElement(element);

  if (
    !TAG_NAMES_WITH_PLACEHOLDER.has(tagName) ||
    (tagName === 'input' &&
      INPUT_TYPES_WITHOUT_PLACEHOLDER.has(resolveInputTypeOfElement(element)))
  ) {
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
