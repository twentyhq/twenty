import { MICROSOFT_EMAIL_FORWARDING_OAUTH_SCOPES } from 'twenty-shared/constants';

// The grant is consumed inside the callback and never stored, so it asks for the
// directory scopes only and skips offline_access entirely.
export const getMicrosoftEmailForwardingOauthScopes = () => {
  return [
    'openid',
    'email',
    'profile',
    ...MICROSOFT_EMAIL_FORWARDING_OAUTH_SCOPES,
  ];
};
