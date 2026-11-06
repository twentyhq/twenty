import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const buildEmailVerificationLinkSearchParams = ({
  emailVerificationToken,
  email,
  verifyEmailRedirectPath,
  affiliatePartnerName,
}: {
  emailVerificationToken: string;
  email: string;
  verifyEmailRedirectPath?: string;
  affiliatePartnerName?: string;
}): Record<string, string> => ({
  emailVerificationToken,
  email,
  ...(isDefined(verifyEmailRedirectPath)
    ? { nextPath: verifyEmailRedirectPath }
    : {}),
  ...(isNonEmptyString(affiliatePartnerName)
    ? { via: affiliatePartnerName }
    : {}),
});
