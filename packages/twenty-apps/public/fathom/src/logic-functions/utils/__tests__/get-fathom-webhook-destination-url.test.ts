import { describe, expect, it } from 'vitest';

import { getFathomWebhookDestinationUrl } from 'src/logic-functions/utils/get-fathom-webhook-destination-url.util';

describe('getFathomWebhookDestinationUrl', () => {
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
