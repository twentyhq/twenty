import { describe, expect, it } from 'vitest';

import { getFathomWebhookDestinationUrl } from 'src/logic-functions/utils/get-fathom-webhook-destination-url.util';

describe('getFathomWebhookDestinationUrl', () => {
  it('builds an isolated functions-domain route with the connection identifier', () => {
    expect(
      getFathomWebhookDestinationUrl({
        functionsUrl: 'https://functions.example.com',
        connectedAccountId: 'connection-id',
      }),
    ).toBe(
      'https://functions.example.com/webhook/fathom?connectionId=connection-id',
    );
  });

  it('preserves the self-hosted functions path', () => {
    expect(
      getFathomWebhookDestinationUrl({
        functionsUrl: 'https://twenty.example.com/s',
        connectedAccountId: 'connection-id',
      }),
    ).toBe(
      'https://twenty.example.com/s/webhook/fathom?connectionId=connection-id',
    );
  });
});
