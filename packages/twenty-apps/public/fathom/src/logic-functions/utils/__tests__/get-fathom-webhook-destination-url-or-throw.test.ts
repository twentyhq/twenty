import { afterEach, describe, expect, it, vi } from 'vitest';

import { getFathomWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-fathom-webhook-destination-url-or-throw.util';

describe('getFathomWebhookDestinationUrlOrThrow', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the resolver id the server injected', () => {
    vi.stubEnv(
      'TWENTY_SERVER_ROUTE_IDS',
      JSON.stringify({
        '72b52885-e1ba-419f-8e2e-052700f2c9f2':
          '4f0e2a51-9c3b-4d8e-a1f7-6b2c9d0e3a14',
      }),
    );

    expect(
      getFathomWebhookDestinationUrlOrThrow({
        apiUrl: 'https://twenty.example.com',
        connectedAccountId: 'connection-id',
      }),
    ).toBe(
      'https://twenty.example.com/webhooks/server/4f0e2a51-9c3b-4d8e-a1f7-6b2c9d0e3a14?connectionId=connection-id',
    );
  });

  it('builds the server route with the connection identifier', () => {
    expect(
      getFathomWebhookDestinationUrlOrThrow({
        apiUrl: 'https://twenty.example.com',
        connectedAccountId: 'connection-id',
      }),
    ).toBe(
      'https://twenty.example.com/webhooks/server/72b52885-e1ba-419f-8e2e-052700f2c9f2?connectionId=connection-id',
    );
  });

  it('preserves a base path on the API URL', () => {
    expect(
      getFathomWebhookDestinationUrlOrThrow({
        apiUrl: 'https://twenty.example.com/api/',
        connectedAccountId: 'connection-id',
      }),
    ).toBe(
      'https://twenty.example.com/api/webhooks/server/72b52885-e1ba-419f-8e2e-052700f2c9f2?connectionId=connection-id',
    );
  });
});
