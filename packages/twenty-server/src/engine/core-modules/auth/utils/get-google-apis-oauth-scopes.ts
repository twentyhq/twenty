export const getGoogleApisOauthScopes = () => {
  return [
    'email',
    'profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/profile.emails.read',
    'https://www.googleapis.com/auth/gmail.send',
  ];
};
