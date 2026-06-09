import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { updateCompaniesStatus } from 'src/logic-functions/utils/update-companies-status';

describe('updateCompaniesStatus', () => {
  it('updates many companies via an id-in filter', async () => {
    let request: Record<string, unknown> | undefined;
    const client = createCoreApiClientMock({
      onMutation: (received) => {
        request = received as Record<string, unknown>;
      },
    });

    await updateCompaniesStatus(client, ['c1', 'c2'], {
      pdlEnrichmentStatus: 'ERROR',
    });

    expect(request).toMatchObject({
      updateCompanies: {
        __args: {
          filter: { id: { in: ['c1', 'c2'] } },
          data: { pdlEnrichmentStatus: 'ERROR' },
        },
      },
    });
  });
});
