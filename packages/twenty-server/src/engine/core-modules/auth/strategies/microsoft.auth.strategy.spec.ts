import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { MicrosoftStrategy } from './microsoft.auth.strategy';

const CREDENTIALS: Record<string, string> = {
  AUTH_MICROSOFT_CLIENT_ID: 'client-id',
  AUTH_MICROSOFT_CLIENT_SECRET: 'client-secret',
  AUTH_MICROSOFT_CALLBACK_URL:
    'https://crm.example.com/auth/microsoft/redirect',
};

const buildConfigService = (tenant: string) =>
  ({
    get: (key: string) =>
      key === 'AUTH_MICROSOFT_TENANT_ID' ? tenant : CREDENTIALS[key],
  }) as unknown as TwentyConfigService;

// passport-oauth2 resolves both endpoints once in the constructor, so they are
// the only place the configured tenant is observable from outside
const getEndpoints = (strategy: MicrosoftStrategy) => {
  const { _authorizeUrl, _accessTokenUrl } = (
    strategy as unknown as {
      _oauth2: { _authorizeUrl: string; _accessTokenUrl: string };
    }
  )._oauth2;

  return { authorizeUrl: _authorizeUrl, accessTokenUrl: _accessTokenUrl };
};

describe('MicrosoftStrategy', () => {
  it('signs in against the shared /common endpoints by default', () => {
    const strategy = new MicrosoftStrategy(buildConfigService('common'));

    expect(getEndpoints(strategy)).toEqual({
      authorizeUrl:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      accessTokenUrl:
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    });
  });

  it('signs in against a single tenant when one is configured', () => {
    const strategy = new MicrosoftStrategy(
      buildConfigService('11111111-2222-3333-4444-555555555555'),
    );

    expect(getEndpoints(strategy)).toEqual({
      authorizeUrl:
        'https://login.microsoftonline.com/11111111-2222-3333-4444-555555555555/oauth2/v2.0/authorize',
      accessTokenUrl:
        'https://login.microsoftonline.com/11111111-2222-3333-4444-555555555555/oauth2/v2.0/token',
    });
  });
});
