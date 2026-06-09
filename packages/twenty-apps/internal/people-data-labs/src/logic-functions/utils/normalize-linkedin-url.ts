import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

const SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\//;
const LEADING_WWW_REGEX = /^www\./;
const TRAILING_SLASHES_REGEX = /\/+$/;

export const normalizeLinkedinUrl = (value: unknown): string | undefined => {
  const text = toText(value);
  if (!isDefined(text)) {
    return undefined;
  }

  const canonicalUrlWithPath = text
    .toLowerCase()
    .replace(SCHEME_REGEX, '')
    .replace(LEADING_WWW_REGEX, '')
    .replace(TRAILING_SLASHES_REGEX, '');

  return canonicalUrlWithPath === '' ? undefined : canonicalUrlWithPath;
};
