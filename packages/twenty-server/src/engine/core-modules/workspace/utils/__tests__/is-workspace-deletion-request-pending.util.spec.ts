import { isWorkspaceDeletionRequestPending } from 'src/engine/core-modules/workspace/utils/is-workspace-deletion-request-pending.util';

describe('isWorkspaceDeletionRequestPending', () => {
  it('matches only the exact pending deletion request', () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');
    const workspace = {
      deletedAt: workspaceDeletedAt,
      applicationUninstallHooksCompletedAt: null,
    };

    expect(
      isWorkspaceDeletionRequestPending({
        workspace,
        workspaceDeletionRequestTimestamp: workspaceDeletedAt.toISOString(),
      }),
    ).toBe(true);
    expect(
      isWorkspaceDeletionRequestPending({
        workspace,
        workspaceDeletionRequestTimestamp: '2026-08-17T10:00:00.000Z',
      }),
    ).toBe(false);
  });
});
