import { describe, expect, it, vi } from 'vitest';

import { fetchAllNodes } from 'src/logic-functions/data/fetch-all-nodes.util';

describe('fetchAllNodes', () => {
  it('collects nodes across pages until hasNextPage is false', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({
        pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        edges: [{ node: 'node-1' }, { node: 'node-2' }],
      })
      .mockResolvedValueOnce({
        pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
        edges: [{ node: 'node-3' }],
      });

    const nodes = await fetchAllNodes<string>(fetchPage);

    expect(nodes).toEqual(['node-1', 'node-2', 'node-3']);
    expect(fetchPage).toHaveBeenNthCalledWith(1, undefined);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 'cursor-1');
  });

  it('throws when hasNextPage is true without an endCursor', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      pageInfo: { hasNextPage: true, endCursor: null },
      edges: [{ node: 'node-1' }],
    });

    await expect(fetchAllNodes<string>(fetchPage)).rejects.toThrow(
      'Inconsistent pagination state: hasNextPage is true without an endCursor',
    );
  });

  it('throws when the query returns no connection', async () => {
    const fetchPage = vi.fn().mockResolvedValue(undefined);

    await expect(fetchAllNodes<string>(fetchPage)).rejects.toThrow(
      'Pagination query returned no connection',
    );
  });
});
