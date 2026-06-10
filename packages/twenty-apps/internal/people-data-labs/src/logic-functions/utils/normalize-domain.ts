import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

const SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\//;
const LEADING_WWW_REGEX = /^www\./;

export const normalizeDomain = (
  rawDomainValue: unknown,
): string | undefined => {
  const domainText = toText(rawDomainValue);
  if (!isDefined(domainText)) {
    return undefined;
  }

  const bareHost = domainText
    .toLowerCase()
    .replace(SCHEME_REGEX, '')
    .split('/')[0]
    .replace(LEADING_WWW_REGEX, '');

  return bareHost === '' ? undefined : bareHost;
};
