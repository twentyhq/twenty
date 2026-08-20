import { buildWorkspaceUninstallHookPayload } from 'src/engine/core-modules/application/application-manifest/utils/build-workspace-uninstall-hook-payload.util';

describe('buildWorkspaceUninstallHookPayload', () => {
  it('should build a deletion-scoped idempotency key when deleting a workspace', () => {
    expect(
      buildWorkspaceUninstallHookPayload({
        applicationVersion: '1.0.0',
        applicationUniversalIdentifier: 'application-universal-identifier',
        workspaceId: 'workspace-id',
        uninstallRequestedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    ).toEqual({
      version: '1.0.0',
      idempotencyKey:
        'workspace-deletion:workspace-id:2026-08-18T10:00:00.000Z:application-universal-identifier',
    });
  });
});
