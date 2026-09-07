import { MICROSOFT_EMAIL_FORWARDING_OAUTH_SCOPES } from 'twenty-shared/constants';

export const getMicrosoftApisOauthScopes = ({
  shouldRequestEmailForwardingScopes,
}: { shouldRequestEmailForwardingScopes?: boolean } = {}) => {
  const scopes = [
    'openid',
    'email',
    'profile',
    'offline_access',
    'Mail.ReadWrite',
    'Mail.Send',
    'Calendars.ReadWrite',
    'User.Read',
    ...(shouldRequestEmailForwardingScopes
      ? MICROSOFT_EMAIL_FORWARDING_OAUTH_SCOPES
      : []),
  ];

  return scopes;
};
