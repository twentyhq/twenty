import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { updatePersonRecord } from 'src/logic-functions/utils/update-person-record';

describe('updatePersonRecord', () => {
  it('updates a single person by id', async () => {
    let request: Record<string, unknown> | undefined;
    const client = createCoreApiClientMock({
      onMutation: (received) => {
        request = received as Record<string, unknown>;
      },
    });

    await updatePersonRecord(client, 'p1', { jobTitle: 'CEO' });

    expect(request).toMatchObject({
      updatePerson: { __args: { id: 'p1', data: { jobTitle: 'CEO' } } },
    });
  });
});
