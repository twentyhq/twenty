import { HOST_RENDERED_HTML_TAG_NAMES } from '@/polyfills/geometry/constants/HostRenderedHtmlTagNames';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

export const isHostRenderedElement = (element: SelectorElementLike): boolean =>
  HOST_RENDERED_HTML_TAG_NAMES.has(resolveHtmlTagNameOfElement(element));
