import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { findWorkspaceMemberIdsByEmails } from 'src/logic-functions/data/find-workspace-member-ids-by-emails';

const buildClient = (
  pages: {
    edges: { node: { id: string; userEmail: string } }[];
    endCursor?: string;
  }[],
) => {
  const queryMock = vi.fn();

  for (const page of pages) {
    queryMock.mockResolvedValueOnce({
      workspaceMembers: {
        edges: page.edges,
        pageInfo: {
          hasNextPage: page.endCursor !== undefined,
          endCursor: page.endCursor ?? null,
        },
      },
    });
  }

  return {
    client: { query: queryMock } as unknown as CoreApiClient,
    queryMock,
  };
};

describe('findWorkspaceMemberIdsByEmails', () => {
  it('should map lowercased emails to member ids', async () => {
    const { client } = buildClient([
      {
        edges: [
          { node: { id: 'member-ada', userEmail: 'Ada@Twenty.com' } },
          { node: { id: 'member-bob', userEmail: 'bob@twenty.com' } },
        ],
      },
    ]);

    const { workspaceMemberIdByEmail, ambiguousEmailCount } =
      await findWorkspaceMemberIdsByEmails(client, {
        emails: ['Ada@Twenty.com', 'bob@twenty.com'],
      });

    expect(workspaceMemberIdByEmail.get('ada@twenty.com')).toBe('member-ada');
    expect(workspaceMemberIdByEmail.get('bob@twenty.com')).toBe('member-bob');
    expect(ambiguousEmailCount).toBe(0);
  });

  it('should ask only for the roster emails through case-insensitive matches', async () => {
    const { client, queryMock } = buildClient([{ edges: [] }]);

    await findWorkspaceMemberIdsByEmails(client, {
      emails: ['Ada@Twenty.com', 'bob@twenty.com'],
    });

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0].workspaceMembers.__args.filter).toEqual({
      or: [
        { userEmail: { ilike: 'ada@twenty.com' } },
        { userEmail: { ilike: 'bob@twenty.com' } },
      ],
    });
  });

  it('should escape like wildcards inside the looked up emails', async () => {
    const { client, queryMock } = buildClient([{ edges: [] }]);

    await findWorkspaceMemberIdsByEmails(client, {
      emails: ['john_doe@twenty.com'],
    });

    expect(queryMock.mock.calls[0][0].workspaceMembers.__args.filter).toEqual({
      or: [{ userEmail: { ilike: 'john\\_doe@twenty.com' } }],
    });
  });

  it('should not query at all when the roster has no vouched email', async () => {
    const { client, queryMock } = buildClient([]);

    const { workspaceMemberIdByEmail, ambiguousEmailCount } =
      await findWorkspaceMemberIdsByEmails(client, { emails: [] });

    expect(queryMock).not.toHaveBeenCalled();
    expect(workspaceMemberIdByEmail.size).toBe(0);
    expect(ambiguousEmailCount).toBe(0);
  });

  it('should drop an email shared by two members and report it', async () => {
    const { client } = buildClient([
      {
        edges: [
          { node: { id: 'member-ada', userEmail: 'shared@twenty.com' } },
          { node: { id: 'member-bob', userEmail: 'Shared@Twenty.com' } },
          { node: { id: 'member-carol', userEmail: 'carol@twenty.com' } },
        ],
      },
    ]);

    const { workspaceMemberIdByEmail, ambiguousEmailCount } =
      await findWorkspaceMemberIdsByEmails(client, {
        emails: ['shared@twenty.com', 'carol@twenty.com'],
      });

    expect(workspaceMemberIdByEmail.has('shared@twenty.com')).toBe(false);
    expect(workspaceMemberIdByEmail.get('carol@twenty.com')).toBe(
      'member-carol',
    );
    expect(ambiguousEmailCount).toBe(1);
  });

  it('should follow pagination within one batch of emails', async () => {
    const { client, queryMock } = buildClient([
      {
        edges: [{ node: { id: 'member-ada', userEmail: 'ada@twenty.com' } }],
        endCursor: 'cursor-2',
      },
      { edges: [{ node: { id: 'member-bob', userEmail: 'bob@twenty.com' } }] },
    ]);

    const { workspaceMemberIdByEmail } = await findWorkspaceMemberIdsByEmails(
      client,
      { emails: ['ada@twenty.com', 'bob@twenty.com'] },
    );

    expect(workspaceMemberIdByEmail.size).toBe(2);
    expect(queryMock.mock.calls[1][0].workspaceMembers.__args.after).toBe(
      'cursor-2',
    );
  });
});
