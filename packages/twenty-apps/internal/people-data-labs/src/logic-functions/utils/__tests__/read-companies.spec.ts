import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { readCompanies } from 'src/logic-functions/utils/read-companies';

type QueryRequest = {
  companies: { __args: { filter: { id: { in: string[] } }; first: number } };
};

describe('readCompanies', () => {
  it('queries companies by an id-in filter and returns the matching nodes', async () => {
    const nodes = [{ id: 'c1' }, { id: 'c2' }];
    let capturedRequest: unknown;
    const client = createCoreApiClientMock({
      queryResult: (request) => {
        capturedRequest = request;

        return { companies: { edges: nodes.map((node) => ({ node })) } };
      },
    });

    const result = await readCompanies({ client, recordIds: ['c1', 'c2'] });

    expect(result).toEqual(nodes);
    expect((capturedRequest as QueryRequest).companies.__args.filter).toEqual({
      id: { in: ['c1', 'c2'] },
    });
  });

  it('returns an empty array without querying when there are no ids', async () => {
    const client = createCoreApiClientMock({
      queryResult: () => {
        throw new Error('should not query');
      },
    });

    expect(await readCompanies({ client, recordIds: [] })).toEqual([]);
  });
});
