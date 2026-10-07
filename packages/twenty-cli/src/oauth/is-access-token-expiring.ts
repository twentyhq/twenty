import { isNumber } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { OAUTH_TIMING } from '@/oauth/constants/oauth-timing.constant';

export const getAccessTokenExpiry = (accessToken: string) => {
  try {
    const payload: unknown = JSON.parse(
      Buffer.from(accessToken.split('.')[1] ?? '', 'base64url').toString(),
    );

    return isPlainObject(payload) && isNumber(payload.exp)
      ? payload.exp * 1000
      : undefined;
  } catch {
    return undefined;
  }
};

export const isAccessTokenExpiring = (accessToken: string) => {
  const expiry = getAccessTokenExpiry(accessToken);

  return (
    isDefined(expiry) &&
    expiry - OAUTH_TIMING.REFRESH_MARGIN_MILLISECONDS < Date.now()
  );
};
