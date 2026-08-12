import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findWorkspaceMemberIdByEmail } from 'src/logic-functions/data/find-workspace-member-id-by-email';

const queryMock = vi.fn();

const client = { query: queryMock } as unknown as CoreApiClient;

const buildQueryResult = (
  members: { id: string; userEmail: string | null }[],
) => ({
  workspaceMembers: { edges: members.map((node) => ({ node })) },
});

describe('findWorkspaceMemberIdByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the member whose email matches regardless of case', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([{ id: 'member-1', userEmail: 'Ada@Twenty.com' }]),
    );

    expect(await findWorkspaceMemberIdByEmail(client, 'ada@twenty.com')).toBe(
      'member-1',
    );
  });

  it('should ignore candidates that only matched the ilike wildcards', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([
        { id: 'member-1', userEmail: 'aXb@twenty.com' },
        { id: 'member-2', userEmail: 'aYb@twenty.com' },
      ]),
    );

    expect(
      await findWorkspaceMemberIdByEmail(client, 'a_b@twenty.com'),
    ).toBeUndefined();
  });

  it('should escape ilike wildcards so the filter itself is exact', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([{ id: 'member-1', userEmail: 'a_b%c@twenty.com' }]),
    );

    expect(await findWorkspaceMemberIdByEmail(client, 'a_b%c@twenty.com')).toBe(
      'member-1',
    );

    const filter = queryMock.mock.calls[0][0].workspaceMembers.__args.filter;

    expect(filter).toEqual({ userEmail: { ilike: 'a\\_b\\%c@twenty.com' } });
  });

  it('should bind nobody when several members share the same email', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult([
        { id: 'member-1', userEmail: 'ada@twenty.com' },
        { id: 'member-2', userEmail: 'ADA@twenty.com' },
      ]),
    );

    expect(
      await findWorkspaceMemberIdByEmail(client, 'ada@twenty.com'),
    ).toBeUndefined();
  });
});
