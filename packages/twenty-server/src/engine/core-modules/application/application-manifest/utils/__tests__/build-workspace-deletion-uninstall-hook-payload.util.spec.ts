import { buildWorkspaceDeletionUninstallHookPayload } from 'src/engine/core-modules/application/application-manifest/utils/build-workspace-deletion-uninstall-hook-payload.util';

describe('buildWorkspaceDeletionUninstallHookPayload', () => {
  it('builds a stable per-application idempotency key', () => {
    expect(
      buildWorkspaceDeletionUninstallHookPayload({
        applicationVersion: '1.0.0',
        applicationUniversalIdentifier: 'application-universal-identifier',
        workspaceId: 'workspace-id',
        workspaceDeletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    ).toEqual({
      version: '1.0.0',
      idempotencyKey:
        'workspace-deletion:workspace-id:2026-08-18T10:00:00.000Z:application-universal-identifier',
    });
  });
});
