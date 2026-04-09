export const getMicrosoftApisOauthScopes = () => {
  const scopes = [
    'openid',
    'email',
    'profile',
    'offline_access',
    'Mail.ReadWrite',
    'Mail.Send',
    'Calendars.Read',
    'User.Read',
  ];

  return scopes;
};
