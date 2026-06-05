import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { readCompany } from 'src/logic-functions/utils/read-company';

describe('readCompany', () => {
  it('returns the first matching company node', async () => {
    const node = { id: 'c1', name: 'Acme Corp' };
    const client = createCoreApiClientMock({
      queryResult: { companies: { edges: [{ node }] } },
    });

    expect(await readCompany(client, 'c1')).toBe(node);
  });

  it('returns undefined when there is no match', async () => {
    const client = createCoreApiClientMock({
      queryResult: { companies: { edges: [] } },
    });

    expect(await readCompany(client, 'c1')).toBeUndefined();
  });
});
