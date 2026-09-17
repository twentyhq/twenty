import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { fetchReadablePeople } from 'src/logic-functions/data/fetch-readable-people.util';

const buildClient = (query: ReturnType<typeof vi.fn>): CoreApiClient =>
  ({ query }) as unknown as CoreApiClient;

describe('fetchReadablePeople', () => {
  it('should keep only the people the query answered with', async () => {
    const query = vi.fn().mockResolvedValue({
      people: {
        edges: [
          { node: { id: 'a', updatedAt: '2024-01-01T00:00:00Z' } },
          { node: { id: 'b', updatedAt: '2024-01-02T00:00:00Z' } },
        ],
      },
    });

    await expect(
      fetchReadablePeople({
        client: buildClient(query),
        personIds: ['a', 'b', 'c'],
      }),
    ).resolves.toEqual([
      { id: 'a', updatedAt: '2024-01-01T00:00:00Z' },
      { id: 'b', updatedAt: '2024-01-02T00:00:00Z' },
    ]);
  });

  it('should return nothing when the caller can read none of the people', async () => {
    const query = vi.fn().mockResolvedValue({ people: { edges: [] } });

    await expect(
      fetchReadablePeople({
        client: buildClient(query),
        personIds: ['a', 'b'],
      }),
    ).resolves.toEqual([]);
  });

  it('should split a selection larger than one batch into several queries', async () => {
    const query = vi.fn().mockResolvedValue({ people: { edges: [] } });
    const personIds = Array.from({ length: 201 }, (_, index) => `p${index}`);

    await fetchReadablePeople({ client: buildClient(query), personIds });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0].people.__args.filter.id.in).toHaveLength(200);
    expect(query.mock.calls[1][0].people.__args.filter.id.in).toHaveLength(1);
  });

  it('should make no query for an empty selection', async () => {
    const query = vi.fn();

    await expect(
      fetchReadablePeople({ client: buildClient(query), personIds: [] }),
    ).resolves.toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });
});
