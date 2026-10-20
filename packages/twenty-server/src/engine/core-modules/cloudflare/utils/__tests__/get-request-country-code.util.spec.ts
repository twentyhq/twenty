import { getRequestCountryCode } from 'src/engine/core-modules/cloudflare/utils/get-request-country-code.util';

describe('getRequestCountryCode', () => {
  it('returns the country Cloudflare located the client in', () => {
    expect(getRequestCountryCode({ headers: { 'cf-ipcountry': 'FR' } })).toBe(
      'FR',
    );
  });

  it('returns null when the request did not go through Cloudflare', () => {
    expect(getRequestCountryCode({ headers: {} })).toBeNull();
  });

  it.each(['XX', 'T1', 'fr', 'FRA'])(
    'returns null for a country code Cloudflare could not resolve (%s)',
    (countryCode) => {
      expect(
        getRequestCountryCode({ headers: { 'cf-ipcountry': countryCode } }),
      ).toBeNull();
    },
  );
});
