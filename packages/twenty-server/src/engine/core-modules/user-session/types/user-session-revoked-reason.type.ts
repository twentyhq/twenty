export enum UserSessionRevokedReason {
  UserSignOut = 'USER_SIGN_OUT',
  UserRevoked = 'USER_REVOKED',
  Superseded = 'SUPERSEDED',
  PasswordChanged = 'PASSWORD_CHANGED',
  ImpersonationEnded = 'IMPERSONATION_ENDED',
  TwoFactorAuthenticationReset = 'TWO_FACTOR_AUTHENTICATION_RESET',
}
