import { describe, expect, it } from 'vitest';

import { getGranolaWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-granola-webhook-destination-url-or-throw.util';

describe('getGranolaWebhookDestinationUrlOrThrow', () => {
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
