import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { listWorkspaceMemberEmails } from 'src/logic-functions/data/list-workspace-member-emails';

const buildClient = (
  edges: { node: { id: string; userEmail: string } }[],
): CoreApiClient =>
  ({
    query: vi.fn().mockResolvedValue({
      workspaceMembers: {
        edges,
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    }),
  }) as unknown as CoreApiClient;

describe('listWorkspaceMemberEmails', () => {
  it('should map lowercased emails to member ids', async () => {
    const memberIdByEmail = await listWorkspaceMemberEmails(
      buildClient([
        { node: { id: 'member-ada', userEmail: 'Ada@Twenty.com' } },
        { node: { id: 'member-bob', userEmail: 'bob@twenty.com' } },
      ]),
    );

    expect(memberIdByEmail.get('ada@twenty.com')).toBe('member-ada');
    expect(memberIdByEmail.get('bob@twenty.com')).toBe('member-bob');
  });

  it('should drop an email shared by two members as ambiguous', async () => {
    const memberIdByEmail = await listWorkspaceMemberEmails(
      buildClient([
        { node: { id: 'member-ada', userEmail: 'shared@twenty.com' } },
        { node: { id: 'member-bob', userEmail: 'Shared@Twenty.com' } },
        { node: { id: 'member-carol', userEmail: 'carol@twenty.com' } },
      ]),
    );

    expect(memberIdByEmail.has('shared@twenty.com')).toBe(false);
    expect(memberIdByEmail.get('carol@twenty.com')).toBe('member-carol');
  });
});
