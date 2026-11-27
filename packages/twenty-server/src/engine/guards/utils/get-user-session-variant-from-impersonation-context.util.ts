import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { type UserSessionVariant } from 'src/engine/core-modules/auth/types/user-session-variant.type';
import { USER_SESSION_VARIANT_BY_IMPERSONATION_LEVEL } from 'src/engine/guards/constants/user-session-variant-by-impersonation-level.constant';
import { isImpersonating } from 'src/engine/guards/utils/is-impersonating.util';

export const getUserSessionVariantFromImpersonationContext = (
  impersonationContext: RawAuthContext['impersonationContext'],
): UserSessionVariant =>
  isDefined(impersonationContext) && isImpersonating(impersonationContext)
    ? USER_SESSION_VARIANT_BY_IMPERSONATION_LEVEL[impersonationContext.level]
    : 'standard';
