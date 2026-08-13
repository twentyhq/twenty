import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';
import { getHostTagName } from '@/utils/getHostTagName';

// Maps standard HTML/SVG tag names to their custom element equivalents
// used by the remote DOM polyfill (e.g. "div" → "html-div",
// "clipPath" → "html-clippath").
// Consumed by the jsx-runtime wrapper so React creates the correct
// custom elements instead of standard HTML/SVG tags.
export const HTML_TAG_TO_CUSTOM_ELEMENT_TAG: Record<string, string> = {
  ...Object.fromEntries(
    ALLOWED_HTML_ELEMENTS.map((element) => [
      getHostTagName(element),
      element.tag,
    ]),
  ),
};
