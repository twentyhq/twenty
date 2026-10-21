import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/constants/HtmlTagToCustomElementTag';

export const HTML_TAG_NAME_BY_REMOTE_ELEMENT_TAG_NAME = new Map(
  Object.entries(HTML_TAG_TO_CUSTOM_ELEMENT_TAG).map(([htmlTag, remoteTag]) => [
    remoteTag,
    htmlTag.toLowerCase(),
  ]),
);
