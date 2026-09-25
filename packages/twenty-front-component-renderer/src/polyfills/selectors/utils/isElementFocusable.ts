import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isElementContentEditable } from '@/polyfills/selectors/utils/isElementContentEditable';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

const ALWAYS_FOCUSABLE_TAG_NAMES = new Set([
  'button',
  'iframe',
  'select',
  'textarea',
]);

const TAG_NAMES_FOCUSABLE_WITH_CONTROLS = new Set(['audio', 'video']);

const isSummaryOfItsDetails = (element: SelectorElementLike): boolean => {
  const parentElement = resolveParentElement(element);

  if (
    !isDefined(parentElement) ||
    resolveHtmlTagNameOfElement(parentElement) !== 'details'
  ) {
    return false;
  }

  const firstSummaryElement = collectChildNodes(parentElement).find(
    (childNode) =>
      isSelectorElementNode(childNode) &&
      resolveHtmlTagNameOfElement(childNode) === 'summary',
  );

  return firstSummaryElement === element;
};

const isFocusableByDefault = (element: SelectorElementLike): boolean => {
  const tagName = resolveHtmlTagNameOfElement(element);

  if (ALWAYS_FOCUSABLE_TAG_NAMES.has(tagName)) {
    return true;
  }

  if (tagName === 'a') {
    return hasElementAttributeIgnoringCase(element, 'href');
  }

  if (tagName === 'summary') {
    return isSummaryOfItsDetails(element);
  }

  return (
    TAG_NAMES_FOCUSABLE_WITH_CONTROLS.has(tagName) &&
    hasElementAttributeIgnoringCase(element, 'controls')
  );
};

export const isElementFocusable = (element: SelectorElementLike): boolean => {
  if (isElementDisabled(element)) {
    return false;
  }

  const tagName = resolveHtmlTagNameOfElement(element);

  if (tagName === 'input') {
    return resolveInputTypeOfElement(element) !== 'hidden';
  }

  if (tagName === 'area') {
    return hasElementAttributeIgnoringCase(element, 'href');
  }

  return (
    isFocusableByDefault(element) ||
    hasElementAttributeIgnoringCase(element, 'tabindex') ||
    isElementContentEditable(element)
  );
};
