import { type VerifyCallback } from 'passport-google-oauth20';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { MicrosoftAPIsOauthCommonStrategy } from './microsoft-apis-oauth-common.auth.strategy';

const CREDENTIALS: Record<string, string> = {
  AUTH_MICROSOFT_CLIENT_ID: 'client-id',
  AUTH_MICROSOFT_CLIENT_SECRET: 'client-secret',
  AUTH_MICROSOFT_APIS_CALLBACK_URL:
    'https://crm.example.com/auth/microsoft-apis/get-access-token',
};

const buildConfigService = (tenant: string) =>
  ({
    get: (key: string) =>
      key === 'AUTH_MICROSOFT_TENANT_ID' ? tenant : CREDENTIALS[key],
  }) as unknown as TwentyConfigService;

class TestMicrosoftAPIsStrategy extends MicrosoftAPIsOauthCommonStrategy {
  async validate(
    _request: Express.Request,
    _accessToken: string,
    _refreshToken: string,
    _profile: unknown,
    done: VerifyCallback,
  ): Promise<void> {
    done(null, {});
  }
}

// passport-oauth2 resolves both endpoints once in the constructor, so they are
// the only place the configured tenant is observable from outside
const getEndpoints = (strategy: TestMicrosoftAPIsStrategy) => {
  const { _authorizeUrl, _accessTokenUrl } = (
    strategy as unknown as {
      _oauth2: { _authorizeUrl: string; _accessTokenUrl: string };
    }
  )._oauth2;

  return { authorizeUrl: _authorizeUrl, accessTokenUrl: _accessTokenUrl };
};

describe('MicrosoftAPIsOauthCommonStrategy', () => {
  it('requests calendar and messaging access through /common by default', () => {
    const strategy = new TestMicrosoftAPIsStrategy(
      buildConfigService('common'),
    );

    expect(getEndpoints(strategy)).toEqual({
      authorizeUrl:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      accessTokenUrl:
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    });
  });

  it('requests calendar and messaging access through the configured tenant', () => {
    const strategy = new TestMicrosoftAPIsStrategy(
      buildConfigService('contoso.onmicrosoft.com'),
    );

    expect(getEndpoints(strategy)).toEqual({
      authorizeUrl:
        'https://login.microsoftonline.com/contoso.onmicrosoft.com/oauth2/v2.0/authorize',
      accessTokenUrl:
        'https://login.microsoftonline.com/contoso.onmicrosoft.com/oauth2/v2.0/token',
    });
  });
});
