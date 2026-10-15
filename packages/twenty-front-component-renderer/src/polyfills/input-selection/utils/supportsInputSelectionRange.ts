import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';
import { resolveInputTypeState } from '@/utils/resolveInputTypeState';

const SELECTION_RANGE_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'tel',
  'password',
]);

export const supportsInputSelectionRange = (
  element: SelectorElementLike,
): boolean =>
  resolveHtmlTagNameOfElement(element) === 'textarea' ||
  SELECTION_RANGE_INPUT_TYPES.has(
    resolveInputTypeState(resolveInputTypeOfElement(element)),
  );
