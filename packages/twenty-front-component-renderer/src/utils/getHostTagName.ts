import { type ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';

export const getHostTagName = (
  element: (typeof ALLOWED_HTML_ELEMENTS)[number],
) =>
  element.htmlTag ??
  (element.tag.startsWith('html-') ? element.tag.slice(5) : element.tag);
