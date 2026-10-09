import { getMicrosoftApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-microsoft-apis-oauth-scopes';

describe('getMicrosoftApisOauthScopes', () => {
  it('requests the exact connect-time scopes, in order', () => {
    expect(getMicrosoftApisOauthScopes()).toStrictEqual([
      'openid',
      'email',
      'profile',
      'offline_access',
      'Mail.ReadWrite',
      'Mail.Send',
      'Calendars.ReadWrite',
      'User.Read',
    ]);
  });
});
