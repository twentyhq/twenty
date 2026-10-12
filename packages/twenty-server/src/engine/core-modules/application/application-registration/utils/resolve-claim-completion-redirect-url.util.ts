import { isNonEmptyString } from '@sniptt/guards';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const toOrigin = (value: string | undefined): string | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
};

// GitHub always calls back on SERVER_URL, while the nonce cookie is bound to
// the host that served the mint. When they differ, only that host can read the
// cookie, so the callback hands the code over to it. The target is checked
// against origins the instance owns so a spoofed Host header at mint time
// cannot turn the callback into an open redirect.
export const resolveClaimCompletionRedirectUrl = ({
  cookieOrigin,
  requestOrigin,
  allowedOrigins,
  code,
  state,
}: {
  cookieOrigin: string | undefined;
  requestOrigin: string;
  allowedOrigins: string[];
  code: string;
  state: string;
}): string | undefined => {
  const targetOrigin = toOrigin(cookieOrigin);

  if (!isDefined(targetOrigin) || targetOrigin === toOrigin(requestOrigin)) {
    return undefined;
  }

  if (!allowedOrigins.some((origin) => toOrigin(origin) === targetOrigin)) {
    return undefined;
  }

  const completionUrl = new URL(
    `${ApiPath.ApplicationRegistrationClaim}/github/complete`,
    targetOrigin,
  );

  completionUrl.searchParams.set('code', code);
  completionUrl.searchParams.set('state', state);

  return completionUrl.toString();
};
