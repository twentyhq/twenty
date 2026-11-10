import { KNOWN_OAUTH_CLIENT_LOGOS } from '@/applications/constants/KnownOAuthClientLogos';
import { isDefined } from 'twenty-shared/utils';

export const getKnownOAuthClientLogoUrl = (
  redirectHost: string | undefined,
) => {
  const logoFileName =
    isDefined(redirectHost) &&
    Object.hasOwn(KNOWN_OAUTH_CLIENT_LOGOS, redirectHost)
      ? KNOWN_OAUTH_CLIENT_LOGOS[redirectHost]
      : undefined;

  return isDefined(logoFileName)
    ? `/images/oauth-clients/${logoFileName}`
    : undefined;
};
