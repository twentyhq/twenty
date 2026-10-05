import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isSummaryOfItsDetails } from '@/polyfills/selectors/utils/isSummaryOfItsDetails';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
const TAG_NAMES_FOCUSABLE_WITH_CONTROLS = new Set(['audio', 'video']);
const ALWAYS_FOCUSABLE_TAG_NAMES = new Set([
  'button',
  'iframe',
  'select',
  'textarea',
]);

export const isFocusableByDefault = (element: SelectorElementLike): boolean => {
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
