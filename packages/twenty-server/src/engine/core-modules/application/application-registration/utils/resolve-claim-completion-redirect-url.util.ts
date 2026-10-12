import { isNonEmptyString } from '@sniptt/guards';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const toUrl = (value: string | undefined): URL | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  try {
    return new URL(value);
  } catch {
    return undefined;
  }
};

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
  const cookieUrl = toUrl(cookieOrigin);

  if (!isDefined(cookieUrl) || cookieUrl.host === toUrl(requestOrigin)?.host) {
    return undefined;
  }

  if (
    !allowedOrigins.some((origin) => toUrl(origin)?.host === cookieUrl.host)
  ) {
    return undefined;
  }

  const handOverUrl = new URL(
    `${ApiPath.ApplicationRegistrationClaim}/github/callback`,
    cookieUrl.origin,
  );

  handOverUrl.searchParams.set('code', code);
  handOverUrl.searchParams.set('state', state);

  return handOverUrl.toString();
};
