export const getGoogleApisOauthScopes = (
  isGmailSendEmailScopeEnabled = false,
) => {
  const scopes = [
    'email',
    'profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/profile.emails.read',
  ];

  if (isGmailSendEmailScopeEnabled) {
    scopes.push('https://www.googleapis.com/auth/gmail.send');
  }

  return scopes;
};
