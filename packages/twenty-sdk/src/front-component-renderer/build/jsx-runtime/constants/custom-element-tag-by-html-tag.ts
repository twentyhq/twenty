declare global {
  var __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: Record<string, string> | undefined;
}

export const CUSTOM_ELEMENT_TAG_BY_HTML_TAG: Record<string, string> =
  globalThis.__HTML_TAG_TO_CUSTOM_ELEMENT_TAG__ || {};
