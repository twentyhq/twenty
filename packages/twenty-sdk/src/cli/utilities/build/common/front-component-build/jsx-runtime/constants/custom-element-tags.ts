import { CUSTOM_ELEMENT_TAG_BY_HTML_TAG } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/constants/custom-element-tag-by-html-tag';

export const CUSTOM_ELEMENT_TAGS: Record<string, boolean> = {};

for (const htmlTag in CUSTOM_ELEMENT_TAG_BY_HTML_TAG) {
  CUSTOM_ELEMENT_TAGS[CUSTOM_ELEMENT_TAG_BY_HTML_TAG[htmlTag]] = true;
}
