import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { readPerson } from 'src/logic-functions/utils/read-person';

describe('readPerson', () => {
  it('returns the first matching person node', async () => {
    const node = { id: 'p1', name: { firstName: 'Jane', lastName: 'Doe' } };
    const client = createCoreApiClientMock({
      queryResult: { people: { edges: [{ node }] } },
    });

    expect(await readPerson(client, 'p1')).toBe(node);
  });

  it('returns undefined when there is no match', async () => {
    const client = createCoreApiClientMock({
      queryResult: { people: { edges: [] } },
    });

    expect(await readPerson(client, 'p1')).toBeUndefined();
  });
});
