import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getServerRouteUrl } from '@/sdk/utils/get-server-route-url';

const RESOLVER_UNIVERSAL_IDENTIFIER = '72b52885-e1ba-419f-8e2e-052700f2c9f2';
const RESOLVER_ID = '4f0e2a51-9c3b-4d8e-a1f7-6b2c9d0e3a14';

describe('getServerRouteUrl', () => {
  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_SERVER_ROUTE_IDS', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should build the route URL from the resolver id', () => {
    vi.stubEnv('TWENTY_API_URL', 'https://api.twenty.com/');
    vi.stubEnv(
      'TWENTY_SERVER_ROUTE_IDS',
      JSON.stringify({ [RESOLVER_UNIVERSAL_IDENTIFIER]: RESOLVER_ID }),
    );

    expect(getServerRouteUrl(RESOLVER_UNIVERSAL_IDENTIFIER)).toBe(
      `https://api.twenty.com/webhooks/server/${RESOLVER_ID}`,
    );
  });

  it('should throw for a logic function that is not a server route', () => {
    vi.stubEnv('TWENTY_API_URL', 'https://api.twenty.com');
    vi.stubEnv('TWENTY_SERVER_ROUTE_IDS', JSON.stringify({}));

    expect(() => getServerRouteUrl(RESOLVER_UNIVERSAL_IDENTIFIER)).toThrow(
      RESOLVER_UNIVERSAL_IDENTIFIER,
    );
  });

  it('should throw outside the app runtime', () => {
    expect(() => getServerRouteUrl(RESOLVER_UNIVERSAL_IDENTIFIER)).toThrow();
  });
});
