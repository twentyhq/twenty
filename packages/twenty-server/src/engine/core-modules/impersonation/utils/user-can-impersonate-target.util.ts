import { type ImpersonationAuthorizationUser } from 'src/engine/core-modules/impersonation/utils/impersonation-authorization-user.type';
import { userHasAdminPrivileges } from 'src/engine/core-modules/impersonation/utils/user-has-admin-privileges.util';
import { userIsFullAdmin } from 'src/engine/core-modules/impersonation/utils/user-is-full-admin.util';

export const userCanImpersonateTarget = ({
  impersonatorUser,
  targetUser,
}: {
  impersonatorUser: ImpersonationAuthorizationUser;
  targetUser: ImpersonationAuthorizationUser;
}): boolean =>
  (!userIsFullAdmin(targetUser) || userIsFullAdmin(impersonatorUser)) &&
  (!userHasAdminPrivileges(targetUser) ||
    userHasAdminPrivileges(impersonatorUser));
