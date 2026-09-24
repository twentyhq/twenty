import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const OPENABLE_TAG_NAMES = new Set(['details', 'dialog']);

export const isElementOpen = (element: SelectorElementLike): boolean =>
  OPENABLE_TAG_NAMES.has(resolveHtmlTagNameOfElement(element)) &&
  hasElementAttributeIgnoringCase(element, 'open');
