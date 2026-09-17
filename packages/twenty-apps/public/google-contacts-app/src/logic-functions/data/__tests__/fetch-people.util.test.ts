import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { fetchPeople } from 'src/logic-functions/data/fetch-people.util';

const buildClient = (query: ReturnType<typeof vi.fn>): CoreApiClient =>
  ({ query }) as unknown as CoreApiClient;

describe('fetchPeople', () => {
  it('should return the people the query answered with', async () => {
    const query = vi.fn().mockResolvedValue({
      people: { edges: [{ node: { id: 'p1' } }, { node: { id: 'p2' } }] },
    });

    await expect(
      fetchPeople({ client: buildClient(query), personIds: ['p1', 'p2'] }),
    ).resolves.toEqual([{ id: 'p1' }, { id: 'p2' }]);
  });

  it('should split a selection larger than one batch into several queries', async () => {
    const query = vi.fn().mockResolvedValue({ people: { edges: [] } });
    const personIds = Array.from({ length: 201 }, (_, index) => `p${index}`);

    await fetchPeople({ client: buildClient(query), personIds });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0].people.__args.filter.id.in).toHaveLength(200);
    expect(query.mock.calls[1][0].people.__args.filter.id.in).toHaveLength(1);
  });

  it('should make no query for an empty selection', async () => {
    const query = vi.fn();

    await expect(
      fetchPeople({ client: buildClient(query), personIds: [] }),
    ).resolves.toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });
});
