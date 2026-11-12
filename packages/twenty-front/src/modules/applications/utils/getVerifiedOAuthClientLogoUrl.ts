import { VERIFIED_OAUTH_CLIENT_LOGOS } from '@/applications/constants/VerifiedOAuthClientLogos';
import { isDefined } from 'twenty-shared/utils';

export const getVerifiedOAuthClientLogoUrl = ({
  name,
  isVerified,
}: {
  name: string;
  isVerified: boolean;
}) => {
  const logoFileName =
    isVerified && Object.hasOwn(VERIFIED_OAUTH_CLIENT_LOGOS, name)
      ? VERIFIED_OAUTH_CLIENT_LOGOS[name]
      : undefined;

  return isDefined(logoFileName)
    ? `/images/oauth-clients/${logoFileName}`
    : undefined;
};
