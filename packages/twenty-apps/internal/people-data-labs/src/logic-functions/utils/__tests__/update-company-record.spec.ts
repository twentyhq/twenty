import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { updateCompanyRecord } from 'src/logic-functions/utils/update-company-record';

describe('updateCompanyRecord', () => {
  it('updates a single company by id', async () => {
    let request: Record<string, unknown> | undefined;
    const client = createCoreApiClientMock({
      onMutation: (received) => {
        request = received as Record<string, unknown>;
      },
    });

    await updateCompanyRecord(client, 'c1', { name: 'Acme Corp' });

    expect(request).toMatchObject({
      updateCompany: { __args: { id: 'c1', data: { name: 'Acme Corp' } } },
    });
  });
});
