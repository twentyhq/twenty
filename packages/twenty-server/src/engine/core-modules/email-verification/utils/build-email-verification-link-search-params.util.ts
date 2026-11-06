import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// The partner travels as `via` so the browser that opens the link stores it, even when it is not the one that signed up
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
