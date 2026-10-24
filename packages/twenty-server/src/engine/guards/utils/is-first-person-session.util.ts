import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';

export const isFirstPersonSession = (
  impersonationContext: RawAuthContext['impersonationContext'],
): boolean => !isDefined(impersonationContext);
