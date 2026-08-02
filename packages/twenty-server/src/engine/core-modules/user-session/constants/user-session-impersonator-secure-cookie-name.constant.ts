// Parks the impersonator's own session token while they impersonate, so
// ending impersonation hands back the credential they already had instead of
// minting an administrator session out of the impersonated user's cookie.
export const USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME =
  '__Host-twenty-impersonator-session';
