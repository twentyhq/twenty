// Minimal user shape the impersonation authorization predicates rely on.
// Kept structural so both UserEntity and the lighter AuthContextUser fit.
export type ImpersonationAuthorizationUser = {
  canImpersonate: boolean;
  canAccessFullAdminPanel: boolean;
};
