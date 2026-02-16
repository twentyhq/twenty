import { ALLOWED_HTML_ELEMENTS } from './AllowedHtmlElements';

const UTILITY_TAG_MAPPINGS: Record<string, string> = {
  'remote-style': 'RemoteStyle',
};

export const HTML_TAG_TO_REMOTE_COMPONENT: Record<string, string> = {
  ...Object.fromEntries(
    ALLOWED_HTML_ELEMENTS.map((element) => [
      element.tag.startsWith('html-') ? element.tag.slice(5) : element.tag,
      element.name,
    ]),
  ),
  ...UTILITY_TAG_MAPPINGS,
};

// Maps standard HTML tag names to their custom element equivalents
// used by the remote DOM polyfill (e.g. "div" → "html-div").
// Consumed by the jsx-runtime wrapper so React creates the correct
// custom elements instead of standard HTML tags.
export const HTML_TAG_TO_CUSTOM_ELEMENT_TAG: Record<string, string> = {
  ...Object.fromEntries(
    ALLOWED_HTML_ELEMENTS.map((element) => [
      element.tag.startsWith('html-') ? element.tag.slice(5) : element.tag,
      element.tag,
    ]),
  ),
};
