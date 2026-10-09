import { getGoogleApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes';

describe('getGoogleApisOauthScopes', () => {
  it('requests the exact connect-time scopes, in order', () => {
    expect(getGoogleApisOauthScopes()).toStrictEqual([
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/profile.emails.read',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
    ]);
  });
});
