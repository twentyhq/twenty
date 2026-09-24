import { HTML_TAG_NAME_BY_REMOTE_ELEMENT_TAG_NAME } from '@/polyfills/selectors/constants/HtmlTagNameByRemoteElementTagName';

export const normalizeRemoteTagNameToHtmlTagName = (tagName: string): string =>
  HTML_TAG_NAME_BY_REMOTE_ELEMENT_TAG_NAME.get(tagName.toLowerCase()) ??
  tagName.toLowerCase();
