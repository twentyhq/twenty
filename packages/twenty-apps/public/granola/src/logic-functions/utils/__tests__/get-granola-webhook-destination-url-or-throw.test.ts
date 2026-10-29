import { afterEach, describe, expect, it, vi } from 'vitest';

import { getGranolaWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-granola-webhook-destination-url-or-throw.util';

describe('getGranolaWebhookDestinationUrlOrThrow', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the resolver id the server injected', () => {
    vi.stubEnv(
      'TWENTY_SERVER_ROUTE_IDS',
      JSON.stringify({
        '91dd18b2-ddfd-4516-bda6-db0e3a2d3e33':
          '4f0e2a51-9c3b-4d8e-a1f7-6b2c9d0e3a14',
      }),
    );

    expect(
      getGranolaWebhookDestinationUrlOrThrow({
        apiUrl: 'https://crm.example.com/',
        registrationId: 'reg-1',
      }),
    ).toBe(
      'https://crm.example.com/webhooks/server/4f0e2a51-9c3b-4d8e-a1f7-6b2c9d0e3a14?registrationId=reg-1',
    );
  });

  it('builds the server route under the API URL with the registration id', () => {
    expect(
      getGranolaWebhookDestinationUrlOrThrow({
        apiUrl: 'https://crm.example.com/',
        registrationId: 'reg-1',
      }),
    ).toBe(
      'https://crm.example.com/webhooks/server/91dd18b2-ddfd-4516-bda6-db0e3a2d3e33?registrationId=reg-1',
    );
  });

  it('drops an existing query string and hash from the API URL', () => {
    expect(
      getGranolaWebhookDestinationUrlOrThrow({
        apiUrl: 'https://crm.example.com/base?token=1#top',
        registrationId: 'reg-1',
      }),
    ).toBe(
      'https://crm.example.com/base/webhooks/server/91dd18b2-ddfd-4516-bda6-db0e3a2d3e33?registrationId=reg-1',
    );
  });

  it('rejects a non-HTTPS API URL', () => {
    expect(() =>
      getGranolaWebhookDestinationUrlOrThrow({
        apiUrl: 'http://localhost:3000',
        registrationId: 'reg-1',
      }),
    ).toThrow('HTTPS');
  });
});
