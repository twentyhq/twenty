import ms from 'ms';
import { isDefined } from 'twenty-shared/utils';

import { type UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';

export const isRevokedRefreshTokenStillRenewable = ({
  revokedAt,
  revokedReason,
  reuseGracePeriod,
  now,
}: {
  revokedAt: Date;
  revokedReason: UserSessionRevokedReason | undefined;
  reuseGracePeriod: string;
  now: Date;
}): boolean => {
  // A revocation with a recorded reason is a security action, not a renewal race between tabs
  if (isDefined(revokedReason)) {
    return false;
  }

  return revokedAt.getTime() > now.getTime() - ms(reuseGracePeriod);
};
