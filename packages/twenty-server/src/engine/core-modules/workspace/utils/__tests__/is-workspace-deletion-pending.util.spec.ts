import {
  isWorkspaceDeletionPending,
  isWorkspaceDeletionRequestPending,
} from 'src/engine/core-modules/workspace/utils/is-workspace-deletion-pending.util';

describe('workspace deletion pending utilities', () => {
  const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');

  it('recognizes a pending workspace deletion', () => {
    expect(
      isWorkspaceDeletionPending({
        deletedAt: workspaceDeletedAt,
        applicationUninstallHooksCompletedAt: null,
      }),
    ).toBe(true);
  });

  it('rejects an active or completed workspace deletion', () => {
    expect(
      isWorkspaceDeletionPending({
        deletedAt: undefined,
        applicationUninstallHooksCompletedAt: null,
      }),
    ).toBe(false);
    expect(
      isWorkspaceDeletionPending({
        deletedAt: workspaceDeletedAt,
        applicationUninstallHooksCompletedAt: new Date(),
      }),
    ).toBe(false);
  });

  it('matches only the exact pending deletion request', () => {
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
