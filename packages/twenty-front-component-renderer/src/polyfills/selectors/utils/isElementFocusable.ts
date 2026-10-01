import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isElementContentEditable } from '@/polyfills/selectors/utils/isElementContentEditable';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { isFocusableByDefault } from '@/polyfills/selectors/utils/isFocusableByDefault';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

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
