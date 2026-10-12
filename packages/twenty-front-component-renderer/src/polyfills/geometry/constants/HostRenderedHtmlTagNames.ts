import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/constants/HtmlTagToCustomElementTag';

export const HOST_RENDERED_HTML_TAG_NAMES: ReadonlySet<string> = new Set(
  Object.keys(HTML_TAG_TO_CUSTOM_ELEMENT_TAG),
);
