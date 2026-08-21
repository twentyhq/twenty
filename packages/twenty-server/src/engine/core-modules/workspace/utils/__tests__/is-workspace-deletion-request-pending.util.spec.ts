import { isWorkspaceDeletionRequestPending } from 'src/engine/core-modules/workspace/utils/is-workspace-deletion-request-pending.util';

describe('isWorkspaceDeletionRequestPending', () => {
  it('should match only when the exact deletion request is pending', () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');
    const workspace = {
      deletedAt: workspaceDeletedAt,
    };

    expect(
      isWorkspaceDeletionRequestPending(
        workspace,
        workspaceDeletedAt.toISOString(),
      ),
    ).toBe(true);
    expect(
      isWorkspaceDeletionRequestPending(workspace, '2026-08-17T10:00:00.000Z'),
    ).toBe(false);
  });
});
