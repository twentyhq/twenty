import { GOOGLE_EMAIL_FORWARDING_OAUTH_SCOPES } from 'twenty-shared/constants';

// The grant is consumed inside the callback and never stored, so it asks for the
// directory scopes only and skips offline access entirely.
export const getGoogleEmailForwardingOauthScopes = () => {
  return ['email', 'profile', ...GOOGLE_EMAIL_FORWARDING_OAUTH_SCOPES];
};
