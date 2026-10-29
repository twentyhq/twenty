import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getServerRouteUrl } from '@/sdk/utils/get-server-route-url';

const RESOLVER_UNIVERSAL_IDENTIFIER = '72b52885-e1ba-419f-8e2e-052700f2c9f2';
const RESOLVER_ID = '4f0e2a51-9c3b-4d8e-a1f7-6b2c9d0e3a14';

describe('getServerRouteUrl', () => {
  const initialEnvironment = process.env;

  beforeEach(() => {
    process.env = { ...initialEnvironment };
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_SERVER_ROUTE_IDS;
  });

  afterEach(() => {
    process.env = initialEnvironment;
  });

  it('should build the route URL from the resolver id', () => {
    process.env.TWENTY_API_URL = 'https://api.twenty.com/';
    process.env.TWENTY_SERVER_ROUTE_IDS = JSON.stringify({
      [RESOLVER_UNIVERSAL_IDENTIFIER]: RESOLVER_ID,
    });

    expect(getServerRouteUrl(RESOLVER_UNIVERSAL_IDENTIFIER)).toBe(
      `https://api.twenty.com/webhooks/server/${RESOLVER_ID}`,
    );
  });

  it('should throw for a logic function that is not a server route', () => {
    process.env.TWENTY_API_URL = 'https://api.twenty.com';
    process.env.TWENTY_SERVER_ROUTE_IDS = JSON.stringify({});

    expect(() => getServerRouteUrl(RESOLVER_UNIVERSAL_IDENTIFIER)).toThrow(
      RESOLVER_UNIVERSAL_IDENTIFIER,
    );
  });

  it('should throw outside the app runtime', () => {
    expect(() => getServerRouteUrl(RESOLVER_UNIVERSAL_IDENTIFIER)).toThrow();
  });
});
