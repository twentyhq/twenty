import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

const SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\//;
const LEADING_WWW_REGEX = /^www\./;

export const normalizeDomain = (value: unknown): string | undefined => {
  const text = toText(value);
  if (!isDefined(text)) {
    return undefined;
  }

  const bareHost = text
    .toLowerCase()
    .replace(SCHEME_REGEX, '')
    .split('/')[0]
    .replace(LEADING_WWW_REGEX, '');

  return bareHost === '' ? undefined : bareHost;
};
