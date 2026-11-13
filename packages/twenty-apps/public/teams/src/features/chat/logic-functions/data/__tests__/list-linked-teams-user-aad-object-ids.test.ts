import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listLinkedTeamsUserAadObjectIdsOrThrow } from 'src/features/chat/logic-functions/data/list-linked-teams-user-aad-object-ids';

describe('listLinkedTeamsUserAadObjectIdsOrThrow', () => {
  const queryMock = vi.fn();
  const client = { query: queryMock };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('collects Entra ids across pages and stops when there is no next page', async () => {
    queryMock
      .mockResolvedValueOnce({
        teamsUserLinks: {
          edges: [
            { node: { teamsUserAadObjectId: 'aad-1' } },
            { node: { teamsUserAadObjectId: '' } },
          ],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      })
      .mockResolvedValueOnce({
        teamsUserLinks: {
          edges: [{ node: { teamsUserAadObjectId: 'aad-2' } }],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
        },
      });

    const result = await listLinkedTeamsUserAadObjectIdsOrThrow({
      client,
      teamsTenantId: 'tenant-1',
    });

    expect([...result]).toEqual(['aad-1', 'aad-2']);
    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock.mock.calls[1][0].teamsUserLinks.__args.after).toBe(
      'cursor-1',
    );
  });

  it('filters by the tenant', async () => {
    queryMock.mockResolvedValueOnce({
      teamsUserLinks: {
        edges: [],
        pageInfo: { hasNextPage: false },
      },
    });

    await listLinkedTeamsUserAadObjectIdsOrThrow({
      client,
      teamsTenantId: 'tenant-9',
    });

    expect(queryMock.mock.calls[0][0].teamsUserLinks.__args.filter).toEqual({
      teamsTenantId: { eq: 'tenant-9' },
    });
  });

  it('throws instead of returning a partial set when the page budget runs out', async () => {
    queryMock.mockResolvedValue({
      teamsUserLinks: {
        edges: [{ node: { teamsUserAadObjectId: 'aad-1' } }],
        pageInfo: { hasNextPage: true, endCursor: 'cursor' },
      },
    });

    await expect(
      listLinkedTeamsUserAadObjectIdsOrThrow({ client, teamsTenantId: 'tenant-1' }),
    ).rejects.toThrow('cannot be listed');
  });
});
