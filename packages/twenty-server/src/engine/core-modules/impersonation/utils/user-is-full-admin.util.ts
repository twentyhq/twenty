import { type ImpersonationAuthorizationUser } from 'src/engine/core-modules/impersonation/utils/impersonation-authorization-user.type';

export const userIsFullAdmin = (
  user: ImpersonationAuthorizationUser,
): boolean => user.canAccessFullAdminPanel === true;
