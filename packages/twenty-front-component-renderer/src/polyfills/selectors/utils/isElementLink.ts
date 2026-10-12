import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const LINK_TAG_NAMES = new Set(['a', 'area', 'link']);

export const isElementLink = (element: SelectorElementLike): boolean =>
  LINK_TAG_NAMES.has(resolveHtmlTagNameOfElement(element)) &&
  hasElementAttributeIgnoringCase(element, 'href');
