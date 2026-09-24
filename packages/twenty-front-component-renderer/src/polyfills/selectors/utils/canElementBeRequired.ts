import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const TAG_NAMES_THAT_CAN_BE_REQUIRED = new Set(['input', 'select', 'textarea']);

export const canElementBeRequired = (element: SelectorElementLike): boolean =>
  TAG_NAMES_THAT_CAN_BE_REQUIRED.has(resolveHtmlTagNameOfElement(element));
