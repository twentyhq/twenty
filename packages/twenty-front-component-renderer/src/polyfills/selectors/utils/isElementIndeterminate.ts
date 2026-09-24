import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

export const isElementIndeterminate = (element: SelectorElementLike): boolean =>
  element.indeterminate === true ||
  (resolveHtmlTagNameOfElement(element) === 'progress' &&
    !hasElementAttributeIgnoringCase(element, 'value'));
