import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { updatePeopleStatus } from 'src/logic-functions/utils/update-people-status';

describe('updatePeopleStatus', () => {
  it('updates many people via an id-in filter', async () => {
    let request: Record<string, unknown> | undefined;
    const client = createCoreApiClientMock({
      onMutation: (received) => {
        request = received as Record<string, unknown>;
      },
    });

    await updatePeopleStatus({
      client,
      recordIds: ['p1', 'p2'],
      data: {
        pdlEnrichmentStatus: 'NOT_FOUND',
      },
    });

    expect(request).toMatchObject({
      updatePeople: {
        __args: {
          filter: { id: { in: ['p1', 'p2'] } },
          data: { pdlEnrichmentStatus: 'NOT_FOUND' },
        },
      },
    });
  });
});
