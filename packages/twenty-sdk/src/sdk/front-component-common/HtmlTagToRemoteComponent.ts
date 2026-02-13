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
