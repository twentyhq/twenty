import { buildWorkspaceUninstallHookPayload } from 'src/engine/core-modules/application/application-manifest/utils/build-workspace-uninstall-hook-payload.util';

describe('buildWorkspaceUninstallHookPayload', () => {
  it('should build a deletion-scoped idempotency key when deleting a workspace', () => {
    expect(
      buildWorkspaceUninstallHookPayload({
        applicationVersion: '1.0.0',
        applicationUniversalIdentifier: 'application-universal-identifier',
        workspaceId: 'workspace-id',
        workspaceRequestAt: new Date('2026-08-18T10:00:00.000Z'),
        workspaceUninstallHookRequestType: 'workspace-deletion',
      }),
    ).toEqual({
      version: '1.0.0',
      idempotencyKey:
        'workspace-deletion:workspace-id:2026-08-18T10:00:00.000Z:application-universal-identifier',
    });
  });

  it('should build a suspension-scoped idempotency key when suspending a workspace', () => {
    expect(
      buildWorkspaceUninstallHookPayload({
        applicationVersion: null,
        applicationUniversalIdentifier: 'application-universal-identifier',
        workspaceId: 'workspace-id',
        workspaceRequestAt: new Date('2026-08-18T11:00:00.000Z'),
        workspaceUninstallHookRequestType: 'workspace-suspension',
      }),
    ).toEqual({
      version: undefined,
      idempotencyKey:
        'workspace-suspension:workspace-id:2026-08-18T11:00:00.000Z:application-universal-identifier',
    });
  });
});
