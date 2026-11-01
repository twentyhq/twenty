import { buildServerUrl } from '@/settings/security/utils/buildServerUrl';

describe('buildServerUrl', () => {
  it('appends the pathname to the server url', () => {
    expect(
      buildServerUrl({
        serverUrl: 'https://api.example.com',
        pathname: '/auth/saml/login/idp-id',
      }),
    ).toBe('https://api.example.com/auth/saml/login/idp-id');
  });

  it('drops a default port the way the server does', () => {
    expect(
      buildServerUrl({
        serverUrl: 'https://crm.example.com:443',
        pathname: '/auth/oidc/callback',
      }),
    ).toBe('https://crm.example.com/auth/oidc/callback');
  });

  it('replaces a path prefix instead of appending to it', () => {
    expect(
      buildServerUrl({
        serverUrl: 'https://crm.example.com/api/',
        pathname: '/auth/saml/callback/idp-id',
      }),
    ).toBe('https://crm.example.com/auth/saml/callback/idp-id');
  });
});
