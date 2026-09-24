import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';

export const resolveHtmlTagNameOfElement = (
  element: SelectorElementLike,
): string => normalizeRemoteTagNameToHtmlTagName(element.localName ?? '');
