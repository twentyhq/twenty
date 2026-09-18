export const APPLICATION_REGISTRATION_CLAIM_STATE_COOKIE_NAME =
  'twenty-app-claim-state';
// __Host- enforces Secure, Path=/ and no Domain attribute at the browser
// level, so a sibling subdomain can never plant the nonce this cookie holds.
export const APPLICATION_REGISTRATION_CLAIM_STATE_SECURE_COOKIE_NAME =
  '__Host-twenty-app-claim-state';
