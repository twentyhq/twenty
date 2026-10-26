import { isNonEmptyString } from '@sniptt/guards';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';

export const isImpersonating = (
  impersonationContext: RawAuthContext['impersonationContext'],
): boolean =>
  isNonEmptyString(impersonationContext?.impersonatorUserWorkspaceId) &&
  isNonEmptyString(impersonationContext?.impersonatedUserWorkspaceId);
