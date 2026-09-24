import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { canElementBeRequired } from '@/polyfills/selectors/utils/canElementBeRequired';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

const INPUT_TYPES_WITHOUT_REQUIRED = new Set([
  'button',
  'color',
  'hidden',
  'image',
  'range',
  'reset',
  'submit',
]);

export const isElementRequired = (element: SelectorElementLike): boolean =>
  canElementBeRequired(element) &&
  !(
    resolveHtmlTagNameOfElement(element) === 'input' &&
    INPUT_TYPES_WITHOUT_REQUIRED.has(resolveInputTypeOfElement(element))
  ) &&
  hasElementAttributeIgnoringCase(element, 'required');
