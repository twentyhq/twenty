import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const TAG_NAMES_THAT_CAN_BE_DISABLED = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'fieldset',
  'optgroup',
  'option',
]);

export const canElementBeDisabled = (element: SelectorElementLike): boolean =>
  TAG_NAMES_THAT_CAN_BE_DISABLED.has(resolveHtmlTagNameOfElement(element));
