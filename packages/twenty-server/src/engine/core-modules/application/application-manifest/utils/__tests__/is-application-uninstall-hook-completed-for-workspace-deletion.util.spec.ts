import { isApplicationUninstallHookCompletedForWorkspaceDeletion } from 'src/engine/core-modules/application/application-manifest/utils/is-application-uninstall-hook-completed-for-workspace-deletion.util';

describe('isApplicationUninstallHookCompletedForWorkspaceDeletion', () => {
  const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');

  it('matches completion for the exact workspace deletion request', () => {
    expect(
      isApplicationUninstallHookCompletedForWorkspaceDeletion({
        workspaceDeletionUninstallHookCompletedForDeletedAt: workspaceDeletedAt,
        workspaceDeletedAt,
      }),
    ).toBe(true);
  });

  it('rejects missing or stale completion', () => {
    expect(
      isApplicationUninstallHookCompletedForWorkspaceDeletion({
        workspaceDeletionUninstallHookCompletedForDeletedAt: null,
        workspaceDeletedAt,
      }),
    ).toBe(false);
    expect(
      isApplicationUninstallHookCompletedForWorkspaceDeletion({
        workspaceDeletionUninstallHookCompletedForDeletedAt: new Date(
          '2026-08-17T10:00:00.000Z',
        ),
        workspaceDeletedAt,
      }),
    ).toBe(false);
  });
});
