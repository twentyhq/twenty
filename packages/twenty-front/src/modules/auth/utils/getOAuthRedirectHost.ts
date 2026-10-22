import { isDefined } from 'twenty-shared/utils';

export const getOAuthRedirectHost = (redirectUrl: string | null) => {
  if (!isDefined(redirectUrl)) {
    return null;
  }

  try {
    return new URL(redirectUrl).host;
  } catch {
    return null;
  }
};
