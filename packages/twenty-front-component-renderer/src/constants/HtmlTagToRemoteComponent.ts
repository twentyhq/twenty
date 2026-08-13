import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';
import { getHostTagName } from '@/utils/getHostTagName';

export const HTML_TAG_TO_REMOTE_COMPONENT: Record<string, string> = {
  ...Object.fromEntries(
    ALLOWED_HTML_ELEMENTS.map((element) => [
      getHostTagName(element),
      element.name,
    ]),
  ),
  'remote-style': 'RemoteStyle',
};
