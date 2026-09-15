import { type ImpersonationAuthorizationUser } from 'src/engine/core-modules/impersonation/utils/impersonation-authorization-user.type';

export const userCanServerImpersonate = (
  user: ImpersonationAuthorizationUser,
): boolean => user.canImpersonate === true;
