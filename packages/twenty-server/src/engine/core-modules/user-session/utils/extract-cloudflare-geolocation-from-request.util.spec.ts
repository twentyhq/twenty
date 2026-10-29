import { extractCloudflareGeolocationFromRequest } from 'src/engine/core-modules/user-session/utils/extract-cloudflare-geolocation-from-request.util';

const buildRequest = (headers: Record<string, string>) => ({ headers });

// How Node exposes a header whose raw bytes are UTF-8.
const asReceivedByNode = (value: string) =>
  Buffer.from(value, 'utf8').toString('latin1');

describe('extractCloudflareGeolocationFromRequest', () => {
  it('should read country, region and city', () => {
    expect(
      extractCloudflareGeolocationFromRequest(
        buildRequest({
          'cf-ipcountry': 'US',
          'cf-region': 'California',
          'cf-ipcity': 'San Francisco',
        }),
      ),
    ).toEqual({ country: 'US', region: 'California', city: 'San Francisco' });
  });

  it('should decode non-ASCII values sent as UTF-8 bytes', () => {
    expect(
      extractCloudflareGeolocationFromRequest(
        buildRequest({
          'cf-ipcountry': 'CH',
          'cf-region': asReceivedByNode('Zürich'),
          'cf-ipcity': asReceivedByNode('Zürich'),
        }),
      ),
    ).toEqual({ country: 'CH', region: 'Zürich', city: 'Zürich' });
  });

  it('should return nulls without Cloudflare headers', () => {
    expect(extractCloudflareGeolocationFromRequest(buildRequest({}))).toEqual({
      country: null,
      region: null,
      city: null,
    });
  });

  it.each(['XX', 'T1', 'France', ''])(
    'should drop the non-country code %p',
    (countryCode) => {
      expect(
        extractCloudflareGeolocationFromRequest(
          buildRequest({ 'cf-ipcountry': countryCode }),
        ).country,
      ).toBe(null);
    },
  );
});
