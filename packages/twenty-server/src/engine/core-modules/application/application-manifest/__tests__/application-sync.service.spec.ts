import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';

describe('ApplicationSyncService', () => {
  const applicationService = {
    findManyInstalledFlatApplications: jest.fn(),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn(),
  };
  const logicFunctionExecutorService = {
    execute: jest.fn(),
  };
  const createService = () =>
    new ApplicationSyncService(
      applicationService as never,
      {} as never,
      {} as never,
      workspaceCacheService as never,
      {} as never,
      {} as never,
      {} as never,
      logicFunctionExecutorService as never,
      {} as never,
      {} as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();

    applicationService.findManyInstalledFlatApplications.mockResolvedValue([
      {
        id: 'application-id',
        uninstallLogicFunctionId: 'logic-function-id',
        universalIdentifier: 'application-universal-identifier',
        version: '1.0.0',
      },
    ]);
    logicFunctionExecutorService.execute.mockResolvedValue({ data: {} });
  });

  it('runs workspace deletion hooks with a stable per-application idempotency key', async () => {
    await createService().runUninstallHooksForWorkspaceApplications({
      workspaceId: 'workspace-id',
      workspaceDeletedAt: new Date('2026-08-18T10:00:00.000Z'),
    });

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith({
      logicFunctionId: 'logic-function-id',
      workspaceId: 'workspace-id',
      workspaceDeletionRequestTimestamp: '2026-08-18T10:00:00.000Z',
      payload: {
        version: '1.0.0',
        idempotencyKey:
          'workspace-deletion:workspace-id:2026-08-18T10:00:00.000Z:application-universal-identifier',
      },
    });
  });

  it('attempts every workspace deletion hook and reports every failure', async () => {
    applicationService.findManyInstalledFlatApplications.mockResolvedValue([
      {
        id: 'first-application-id',
        uninstallLogicFunctionId: 'first-logic-function-id',
        universalIdentifier: 'first-application',
        version: '1.0.0',
      },
      {
        id: 'second-application-id',
        uninstallLogicFunctionId: 'second-logic-function-id',
        universalIdentifier: 'second-application',
        version: '2.0.0',
      },
    ]);
    logicFunctionExecutorService.execute
      .mockResolvedValueOnce({
        error: { errorMessage: 'first cleanup failed' },
      })
      .mockRejectedValueOnce(new Error('second cleanup failed'));

    await expect(
      createService().runUninstallHooksForWorkspaceApplications({
        workspaceId: 'workspace-id',
        workspaceDeletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    ).rejects.toThrow(
      'first-application: first cleanup failed; second-application: second cleanup failed',
    );

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledTimes(2);
  });
});
