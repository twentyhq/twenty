import { describe, expect, it, vi } from 'vitest';

import { findWorkspaceMemberIdByEmail } from 'src/features/chat/logic-functions/data/find-workspace-member-id-by-email';

const buildClient = (memberIds: string[]) => ({
  query: vi.fn().mockResolvedValue({
    workspaceMembers: {
      edges: memberIds.map((id) => ({ node: { id } })),
    },
  }),
});

describe('findWorkspaceMemberIdByEmail', () => {
  it('should match the email case-insensitively and escape LIKE wildcards', async () => {
    const client = buildClient(['workspace-member-id']);

    expect(
      await findWorkspaceMemberIdByEmail({
        client,
        email: 'Jane_Doe@acme.com',
      }),
    ).toBe('workspace-member-id');
    expect(client.query).toHaveBeenCalledWith({
      workspaceMembers: expect.objectContaining({
        __args: {
          filter: { userEmail: { ilike: 'Jane\\_Doe@acme.com' } },
          first: 2,
        },
      }),
    });
  });

  it('should return nothing when no member has the email', async () => {
    expect(
      await findWorkspaceMemberIdByEmail({
        client: buildClient([]),
        email: 'nobody@acme.com',
      }),
    ).toBeUndefined();
  });

  it('should not pick a member when the email matches more than one', async () => {
    expect(
      await findWorkspaceMemberIdByEmail({
        client: buildClient(['first-member-id', 'second-member-id']),
        email: 'jane@acme.com',
      }),
    ).toBeUndefined();
  });
});
