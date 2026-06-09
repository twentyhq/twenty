import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { readPeople } from 'src/logic-functions/utils/read-people';

type QueryRequest = {
  people: { __args: { filter: { id: { in: string[] } }; first: number } };
};

describe('readPeople', () => {
  it('queries people by an id-in filter and returns the matching nodes', async () => {
    const nodes = [{ id: 'p1' }, { id: 'p2' }];
    let capturedRequest: unknown;
    const client = createCoreApiClientMock({
      queryResult: (request) => {
        capturedRequest = request;

        return { people: { edges: nodes.map((node) => ({ node })) } };
      },
    });

    const result = await readPeople(client, ['p1', 'p2']);

    expect(result).toEqual(nodes);
    expect((capturedRequest as QueryRequest).people.__args.filter).toEqual({
      id: { in: ['p1', 'p2'] },
    });
    expect((capturedRequest as QueryRequest).people.__args.first).toBe(2);
  });

  it('returns an empty array without querying when there are no ids', async () => {
    const client = createCoreApiClientMock({
      queryResult: () => {
        throw new Error('should not query');
      },
    });

    expect(await readPeople(client, [])).toEqual([]);
  });
});
