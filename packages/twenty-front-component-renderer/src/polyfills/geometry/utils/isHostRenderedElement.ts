import { isString } from '@sniptt/guards';

import { HOST_RENDERED_HTML_TAG_NAMES } from '@/polyfills/geometry/constants/HostRenderedHtmlTagNames';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';

export const isHostRenderedElement = (element: object): boolean => {
  const localName: unknown = Reflect.get(element, 'localName');

  return (
    isString(localName) &&
    HOST_RENDERED_HTML_TAG_NAMES.has(
      normalizeRemoteTagNameToHtmlTagName(localName),
    )
  );
};
