import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getServerRouteUrl } from '@/sdk/utils/get-server-route-url';

const RESOLVER_UNIVERSAL_IDENTIFIER = '72b52885-e1ba-419f-8e2e-052700f2c9f2';
const APPLICATION_REGISTRATION_ID = '4f0e2a51-9c3b-4d8e-a1f7-6b2c9d0e3a14';

describe('getServerRouteUrl', () => {
  beforeEach(() => {
    vi.stubEnv('TWENTY_SERVER_ROUTES_URL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should append the logic function universal identifier to the routes URL', () => {
    vi.stubEnv(
      'TWENTY_SERVER_ROUTES_URL',
      `https://api.twenty.com/webhooks/server/${APPLICATION_REGISTRATION_ID}`,
    );

    expect(getServerRouteUrl(RESOLVER_UNIVERSAL_IDENTIFIER)).toBe(
      `https://api.twenty.com/webhooks/server/${APPLICATION_REGISTRATION_ID}/${RESOLVER_UNIVERSAL_IDENTIFIER}`,
    );
  });

  it('should throw outside the app runtime', () => {
    expect(() => getServerRouteUrl(RESOLVER_UNIVERSAL_IDENTIFIER)).toThrow();
  });
});
