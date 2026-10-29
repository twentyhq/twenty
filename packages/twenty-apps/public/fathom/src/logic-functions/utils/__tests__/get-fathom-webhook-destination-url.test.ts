import { afterEach, describe, expect, it, vi } from 'vitest';

import { getFathomWebhookDestinationUrl } from 'src/logic-functions/utils/get-fathom-webhook-destination-url.util';

describe('getFathomWebhookDestinationUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds the URL from the injected server routes URL', () => {
    vi.stubEnv(
      'TWENTY_SERVER_ROUTES_URL',
      'https://twenty.example.com/webhooks/server/4f0e2a51-9c3b-4d8e-a1f7-6b2c9d0e3a14',
    );

    expect(
      getFathomWebhookDestinationUrl({
        apiUrl: 'https://twenty.example.com',
        connectedAccountId: 'connection-id',
      }),
    ).toBe(
      'https://twenty.example.com/webhooks/server/4f0e2a51-9c3b-4d8e-a1f7-6b2c9d0e3a14/72b52885-e1ba-419f-8e2e-052700f2c9f2?connectionId=connection-id',
    );
  });

  it('builds the server route with the connection identifier', () => {
    expect(
      getFathomWebhookDestinationUrl({
        apiUrl: 'https://twenty.example.com',
        connectedAccountId: 'connection-id',
      }),
    ).toBe(
      'https://twenty.example.com/webhooks/server/72b52885-e1ba-419f-8e2e-052700f2c9f2?connectionId=connection-id',
    );
  });

  it('preserves a base path on the API URL', () => {
    expect(
      getFathomWebhookDestinationUrl({
        apiUrl: 'https://twenty.example.com/api/',
        connectedAccountId: 'connection-id',
      }),
    ).toBe(
      'https://twenty.example.com/api/webhooks/server/72b52885-e1ba-419f-8e2e-052700f2c9f2?connectionId=connection-id',
    );
  });
});
