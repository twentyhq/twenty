import { describe, expect, it } from 'vitest';

import { isProxySignInUrl } from '@/transport/is-proxy-sign-in-url';

const API_ORIGIN = 'https://twenty.example.com';

describe('isProxySignInUrl', () => {
  it.each([
    'https://team.cloudflareaccess.com/cdn-cgi/access/login/twenty.example.com',
    'https://accounts.google.com/o/oauth2/v2/auth?client_id=iap',
    'https://twenty.example.com/oauth2/start?rd=%2Fgraphql',
    'https://authenticate.example.com/.pomerium/sign_in',
    'https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize',
    'https://sso.example.com/realms/corp/protocol/openid-connect/auth',
  ])('recognizes %s', (url) => {
    expect(
      isProxySignInUrl({ url: new URL(url), requestOrigin: API_ORIGIN }),
    ).toBe(true);
  });

  it.each([
    'https://twenty.example.com/graphql',
    'https://www.example.com/rest/companies',
    'https://example.com/authors/login-history-report',
  ])('does not flag %s', (url) => {
    expect(
      isProxySignInUrl({ url: new URL(url), requestOrigin: API_ORIGIN }),
    ).toBe(false);
  });

  it('ignores the host of a same-origin redirect', () => {
    const requestOrigin = 'https://sso.acme.com';

    expect(
      isProxySignInUrl({
        url: new URL(`${requestOrigin}/rest/companies`),
        requestOrigin,
      }),
    ).toBe(false);
    expect(
      isProxySignInUrl({
        url: new URL(`${requestOrigin}/oauth2/start`),
        requestOrigin,
      }),
    ).toBe(true);
  });
});
