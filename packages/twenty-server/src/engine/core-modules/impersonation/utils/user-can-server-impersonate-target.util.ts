import { type ImpersonationAuthorizationUser } from 'src/engine/core-modules/impersonation/utils/impersonation-authorization-user.type';
import { userIsFullAdmin } from 'src/engine/core-modules/impersonation/utils/user-is-full-admin.util';

export const userCanServerImpersonateTarget = ({
  impersonatorUser,
  targetUser,
}: {
  impersonatorUser: ImpersonationAuthorizationUser;
  targetUser: ImpersonationAuthorizationUser;
}): boolean =>
  !userIsFullAdmin(targetUser) || userIsFullAdmin(impersonatorUser);
