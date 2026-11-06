import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const buildEmailVerificationLinkSearchParams = ({
  emailVerificationToken,
  email,
  verifyEmailRedirectPath,
  partner,
}: {
  emailVerificationToken: string;
  email: string;
  verifyEmailRedirectPath?: string;
  partner?: string;
}): Record<string, string> => ({
  emailVerificationToken,
  email,
  ...(isDefined(verifyEmailRedirectPath)
    ? { nextPath: verifyEmailRedirectPath }
    : {}),
  ...(isNonEmptyString(partner) ? { via: partner } : {}),
});
