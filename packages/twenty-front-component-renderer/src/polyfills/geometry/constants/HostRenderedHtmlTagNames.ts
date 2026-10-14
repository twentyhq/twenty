import { HTML_TAG_NAME_BY_REMOTE_ELEMENT_TAG_NAME } from '@/polyfills/selectors/constants/HtmlTagNameByRemoteElementTagName';

export const HOST_RENDERED_HTML_TAG_NAMES: ReadonlySet<string> = new Set(
  HTML_TAG_NAME_BY_REMOTE_ELEMENT_TAG_NAME.values(),
);
