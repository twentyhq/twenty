import { isWorkspaceDeletionPending } from 'src/engine/core-modules/workspace/utils/is-workspace-deletion-pending.util';

describe('isWorkspaceDeletionPending', () => {
  const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');

  it('should return true when the workspace is soft deleted', () => {
    expect(
      isWorkspaceDeletionPending({
        deletedAt: workspaceDeletedAt,
      }),
    ).toBe(true);
  });

  it('should return false when the workspace is not soft deleted', () => {
    expect(
      isWorkspaceDeletionPending({
        deletedAt: undefined,
      }),
    ).toBe(false);
  });
});
