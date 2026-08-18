import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { isWorkspaceSuspensionUninstallRequestPending } from 'src/engine/core-modules/workspace/utils/is-workspace-suspension-uninstall-request-pending.util';

describe('isWorkspaceSuspensionUninstallRequestPending', () => {
  const workspaceSuspendedAt = new Date('2026-08-18T10:00:00.000Z');

  it('should return true when the exact suspension request is pending', () => {
    expect(
      isWorkspaceSuspensionUninstallRequestPending(
        {
          activationStatus: WorkspaceActivationStatus.SUSPENDED,
          deletedAt: undefined,
          suspendedAt: workspaceSuspendedAt,
        },
        workspaceSuspendedAt.toISOString(),
      ),
    ).toBe(true);
  });

  it('should return false when the suspension request is stale', () => {
    expect(
      isWorkspaceSuspensionUninstallRequestPending(
        {
          activationStatus: WorkspaceActivationStatus.SUSPENDED,
          deletedAt: undefined,
          suspendedAt: workspaceSuspendedAt,
        },
        '2026-08-17T10:00:00.000Z',
      ),
    ).toBe(false);
  });

  it('should return false when the workspace was deleted after suspension', () => {
    expect(
      isWorkspaceSuspensionUninstallRequestPending(
        {
          activationStatus: WorkspaceActivationStatus.SUSPENDED,
          deletedAt: new Date('2026-08-18T11:00:00.000Z'),
          suspendedAt: workspaceSuspendedAt,
        },
        workspaceSuspendedAt.toISOString(),
      ),
    ).toBe(false);
  });
});
