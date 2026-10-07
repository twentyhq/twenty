type GlobalThisWithCustomElementTags = typeof globalThis & {
  __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__?: Record<string, string>;
};

export const CUSTOM_ELEMENT_TAG_BY_HTML_TAG: Record<string, string> =
  (globalThis as GlobalThisWithCustomElementTags)
    .__HTML_TAG_TO_CUSTOM_ELEMENT_TAG__ || {};
