import { matchesRegisteredRedirectUri } from 'src/engine/core-modules/auth/utils/matches-registered-redirect-uri.util';

describe('matchesRegisteredRedirectUri', () => {
  it.each([
    ['https://app.example.com/callback', 'https://app.example.com/callback'],
    ['http://127.0.0.1:3000/callback', 'http://127.0.0.1:51234/callback'],
    ['http://localhost/callback', 'http://localhost:8080/callback'],
  ])('accepts %s for %s', (registeredUri, requestedUri) => {
    expect(matchesRegisteredRedirectUri(registeredUri, requestedUri)).toBe(
      true,
    );
  });

  it.each([
    [
      'https://app.example.com:443/callback',
      'https://app.example.com:8443/callback',
    ],
    ['http://127.0.0.1:3000/callback', 'http://localhost:3000/callback'],
    ['http://127.0.0.1:3000/callback', 'http://127.0.0.1:3000/other'],
    ['http://127.0.0.1:3000/callback', 'http://127.0.0.1:3000/callback?next=1'],
    ['http://127.0.0.1:3000/callback', 'https://127.0.0.1:3000/callback'],
  ])('rejects %s for %s', (registeredUri, requestedUri) => {
    expect(matchesRegisteredRedirectUri(registeredUri, requestedUri)).toBe(
      false,
    );
  });
});
