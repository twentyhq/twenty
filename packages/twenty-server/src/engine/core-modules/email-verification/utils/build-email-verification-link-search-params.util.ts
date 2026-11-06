import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const buildEmailVerificationLinkSearchParams = ({
  emailVerificationToken,
  email,
  verifyEmailRedirectPath,
  partnerName,
}: {
  emailVerificationToken: string;
  email: string;
  verifyEmailRedirectPath?: string;
  partnerName?: string;
}): Record<string, string> => ({
  emailVerificationToken,
  email,
  ...(isDefined(verifyEmailRedirectPath)
    ? { nextPath: verifyEmailRedirectPath }
    : {}),
  ...(isNonEmptyString(partnerName) ? { via: partnerName } : {}),
});
