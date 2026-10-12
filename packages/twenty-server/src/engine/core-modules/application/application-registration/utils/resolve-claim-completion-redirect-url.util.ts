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
