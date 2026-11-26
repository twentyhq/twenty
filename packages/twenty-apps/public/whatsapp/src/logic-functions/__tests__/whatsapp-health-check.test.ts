import { describe, expect, it } from 'vitest';

import { whatsappHealthCheckHandler } from 'src/logic-functions/whatsapp-health-check';

describe('whatsappHealthCheckHandler', () => {
  it('points members to their WhatsApp app preferences', async () => {
    process.env.APPLICATION_ID = 'application-id';

    await expect(whatsappHealthCheckHandler()).resolves.toMatchObject({
      status: 'INFO',
      action: {
        label: 'Open app preferences',
        location: '/settings/accounts/applications/application-id',
      },
    });
  });
});
