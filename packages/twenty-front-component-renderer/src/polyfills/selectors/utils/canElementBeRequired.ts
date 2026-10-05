import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

const TAG_NAMES_THAT_CAN_BE_REQUIRED = new Set(['input', 'select', 'textarea']);

const INPUT_TYPES_WITHOUT_REQUIRED = new Set([
  'button',
  'color',
  'hidden',
  'image',
  'range',
  'reset',
  'submit',
]);

export const canElementBeRequired = (element: SelectorElementLike): boolean =>
  TAG_NAMES_THAT_CAN_BE_REQUIRED.has(resolveHtmlTagNameOfElement(element)) &&
  !(
    resolveHtmlTagNameOfElement(element) === 'input' &&
    INPUT_TYPES_WITHOUT_REQUIRED.has(resolveInputTypeOfElement(element))
  );
