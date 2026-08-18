import { isWorkspaceDeletionPending } from 'src/engine/core-modules/workspace/utils/is-workspace-deletion-pending.util';

describe('isWorkspaceDeletionPending', () => {
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
});
