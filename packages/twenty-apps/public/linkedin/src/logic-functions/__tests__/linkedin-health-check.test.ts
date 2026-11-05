import { describe, expect, it } from 'vitest';

import { linkedinHealthCheckHandler } from 'src/logic-functions/linkedin-health-check';

describe('linkedinHealthCheckHandler', () => {
  it('points members to their LinkedIn app preferences', async () => {
    process.env.APPLICATION_ID = 'application-id';

    await expect(linkedinHealthCheckHandler()).resolves.toMatchObject({
      status: 'INFO',
      action: {
        label: 'Open app preferences',
        location: '/settings/accounts/applications/application-id',
      },
    });
  });
});
