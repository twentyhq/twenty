import { isClaimStartOriginAllowed } from 'src/engine/core-modules/application/application-registration/utils/is-claim-start-origin-allowed.util';

describe('isClaimStartOriginAllowed', () => {
  const allowedOrigins = [
    'https://api.twenty.com',
    'https://twenty.com',
    'https://acme.twenty.com/',
  ];

  it.each([
    'https://acme.twenty.com',
    'https://ACME.twenty.com:443',
    'https://api.twenty.com',
  ])('accepts a page on a served origin (%s)', (origin) => {
    expect(isClaimStartOriginAllowed({ origin, allowedOrigins })).toBe(true);
  });

  it.each([
    'https://crm.acme.com',
    'https://evil.example',
    'http://acme.twenty.com',
    'null',
    'file:///tmp/page.html',
    '',
    undefined,
  ])('refuses any other origin (%p)', (origin) => {
    expect(isClaimStartOriginAllowed({ origin, allowedOrigins })).toBe(false);
  });
});
