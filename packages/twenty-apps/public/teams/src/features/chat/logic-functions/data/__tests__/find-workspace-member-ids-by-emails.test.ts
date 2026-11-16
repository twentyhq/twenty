import { describe, expect, it, vi } from 'vitest';

import { findWorkspaceMemberIdsByEmails } from 'src/features/chat/logic-functions/data/find-workspace-member-ids-by-emails';

type MembersPage = {
  members: { id: string; userEmail: string }[];
  hasNextPage?: boolean;
};

const buildClient = (pages: MembersPage[]) => {
  const query = vi.fn();

  pages.forEach(({ members, hasNextPage = false }, index) => {
    query.mockResolvedValueOnce({
      workspaceMembers: {
        edges: members.map((node) => ({ node })),
        pageInfo: { hasNextPage, endCursor: `cursor-${index}` },
      },
    });
  });

  return { query };
};

describe('findWorkspaceMemberIdsByEmails', () => {
  it('maps lowercased emails to member ids with an escaped case-insensitive filter', async () => {
    const client = buildClient([
      { members: [{ id: 'member-ada', userEmail: 'Ada@Twenty.com' }] },
    ]);

    const result = await findWorkspaceMemberIdsByEmails({
      client,
      emails: ['ADA@twenty.com', 'ada@twenty.com', 'bob_x@twenty.com'],
    });

    expect(result.workspaceMemberIdByEmail).toEqual(
      new Map([['ada@twenty.com', 'member-ada']]),
    );
    expect(result.ambiguousEmailCount).toBe(0);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith({
      workspaceMembers: expect.objectContaining({
        __args: {
          filter: {
            or: [
              { userEmail: { ilike: 'ada@twenty.com' } },
              { userEmail: { ilike: 'bob\\_x@twenty.com' } },
            ],
          },
          first: 200,
        },
      }),
    });
  });

  it('drops an email that belongs to more than one member', async () => {
    const client = buildClient([
      {
        members: [
          { id: 'member-1', userEmail: 'shared@twenty.com' },
          { id: 'member-2', userEmail: 'shared@twenty.com' },
          { id: 'member-ada', userEmail: 'ada@twenty.com' },
        ],
      },
    ]);

    const result = await findWorkspaceMemberIdsByEmails({
      client,
      emails: ['shared@twenty.com', 'ada@twenty.com'],
    });

    expect(result.workspaceMemberIdByEmail).toEqual(
      new Map([['ada@twenty.com', 'member-ada']]),
    );
    expect(result.ambiguousEmailCount).toBe(1);
  });

  it('follows pagination within a query and chunks the emails', async () => {
    const emails = Array.from(
      { length: 51 },
      (_, index) => `user${index}@twenty.com`,
    );
    const client = buildClient([
      {
        members: [{ id: 'member-0', userEmail: 'user0@twenty.com' }],
        hasNextPage: true,
      },
      { members: [{ id: 'member-1', userEmail: 'user1@twenty.com' }] },
      { members: [{ id: 'member-50', userEmail: 'user50@twenty.com' }] },
    ]);

    const result = await findWorkspaceMemberIdsByEmails({ client, emails });

    expect(result.workspaceMemberIdByEmail.size).toBe(3);
    expect(client.query).toHaveBeenCalledTimes(3);
    expect(client.query.mock.calls[1][0].workspaceMembers.__args.after).toBe(
      'cursor-0',
    );
    expect(
      client.query.mock.calls[2][0].workspaceMembers.__args.filter.or,
    ).toHaveLength(1);
  });
});
