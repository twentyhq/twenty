import { ALLOWED_HTML_ELEMENTS } from './AllowedHtmlElements';

export const HTML_TAG_TO_REMOTE_COMPONENT: Record<string, string> =
  Object.fromEntries(
    ALLOWED_HTML_ELEMENTS.map((element) => [
      element.tag.startsWith('html-') ? element.tag.slice(5) : element.tag,
      element.name,
    ]),
  );
