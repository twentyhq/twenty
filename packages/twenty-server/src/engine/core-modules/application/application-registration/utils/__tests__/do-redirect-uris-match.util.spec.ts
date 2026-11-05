import { doRedirectUrisMatch } from 'src/engine/core-modules/application/application-registration/utils/do-redirect-uris-match.util';

describe('doRedirectUrisMatch', () => {
  it('matches identical callbacks', () => {
    expect(
      doRedirectUrisMatch({
        registeredRedirectUri: 'https://example.com/callback',
        redirectUri: 'https://example.com/callback',
      }),
    ).toBe(true);
  });

  it('ignores the port of a registered loopback callback', () => {
    expect(
      doRedirectUrisMatch({
        registeredRedirectUri: 'http://localhost/callback',
        redirectUri: 'http://localhost:3118/callback',
      }),
    ).toBe(true);
    expect(
      doRedirectUrisMatch({
        registeredRedirectUri: 'http://127.0.0.1/callback',
        redirectUri: 'http://127.0.0.1:51234/callback',
      }),
    ).toBe(true);
  });

  it('still compares the host and path of a loopback callback', () => {
    expect(
      doRedirectUrisMatch({
        registeredRedirectUri: 'http://localhost/callback',
        redirectUri: 'http://127.0.0.1:3118/callback',
      }),
    ).toBe(false);
    expect(
      doRedirectUrisMatch({
        registeredRedirectUri: 'http://localhost/callback',
        redirectUri: 'http://localhost:3118/other',
      }),
    ).toBe(false);
  });

  it('keeps the port of any other callback', () => {
    expect(
      doRedirectUrisMatch({
        registeredRedirectUri: 'https://example.com/callback',
        redirectUri: 'https://example.com:8443/callback',
      }),
    ).toBe(false);
  });
});
