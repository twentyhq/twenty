import { type Repository } from 'typeorm';

import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

import { ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

describe('ApplicationUninstallService', () => {
  const applicationRepository = {
    find: jest.fn(),
    update: jest.fn(),
  };
  const applicationService = {
    findManyApplications: jest.fn(),
  };
  const logicFunctionExecutorService = {
    execute: jest.fn(),
  };

  const createService = () =>
    new ApplicationUninstallService(
      applicationRepository as unknown as Repository<ApplicationEntity>,
      applicationService as unknown as ApplicationService,
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
    );

  const createApplication = ({
    id,
    uninstallHookCompletedForRequestedAt = null,
  }: {
    id: string;
    uninstallHookCompletedForRequestedAt?: Date | null;
  }) =>
    Object.assign(new ApplicationEntity(), {
      id,
      universalIdentifier: `application-${id}`,
      uninstallLogicFunctionId: `logic-function-${id}`,
      uninstallHookCompletedForRequestedAt,
      version: '1.0.0',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    logicFunctionExecutorService.execute.mockResolvedValue({
      data: null,
      duration: 1,
      logs: '',
      status: LogicFunctionExecutionStatus.SUCCESS,
    });
  });

  it('should attempt every hook when one application hook fails', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');
    const successfulApplication = createApplication({ id: 'successful' });
    const failingApplication = createApplication({ id: 'failing' });

    applicationService.findManyApplications.mockResolvedValue([
      successfulApplication,
      failingApplication,
    ]);
    logicFunctionExecutorService.execute
      .mockResolvedValueOnce({
        data: null,
        duration: 1,
        logs: '',
        status: LogicFunctionExecutionStatus.SUCCESS,
      })
      .mockResolvedValueOnce({
        data: null,
        duration: 1,
        logs: '',
        status: LogicFunctionExecutionStatus.ERROR,
        error: {
          errorType: 'Error',
          errorMessage: 'cleanup failed',
          stackTrace: '',
        },
      });

    await expect(
      createService().runUninstallHooksForWorkspaceDeletion({
        workspaceId: 'workspace-id',
        workspaceDeletedAt,
      }),
    ).rejects.toThrow('cleanup failed');

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledTimes(2);
  });

  it('should reuse the idempotency key when retrying a failed workspace deletion request', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');

    applicationService.findManyApplications.mockResolvedValue([
      createApplication({ id: 'retried' }),
    ]);
    logicFunctionExecutorService.execute
      .mockResolvedValueOnce({
        data: null,
        duration: 1,
        logs: '',
        status: LogicFunctionExecutionStatus.ERROR,
        error: {
          errorType: 'Error',
          errorMessage: 'cleanup failed',
          stackTrace: '',
        },
      })
      .mockResolvedValueOnce({
        data: null,
        duration: 1,
        logs: '',
        status: LogicFunctionExecutionStatus.SUCCESS,
      });

    const applicationUninstallService = createService();

    await expect(
      applicationUninstallService.runUninstallHooksForWorkspaceDeletion({
        workspaceId: 'workspace-id',
        workspaceDeletedAt,
      }),
    ).rejects.toThrow('cleanup failed');
    await applicationUninstallService.runUninstallHooksForWorkspaceDeletion({
      workspaceId: 'workspace-id',
      workspaceDeletedAt,
    });

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledTimes(2);
    expect(logicFunctionExecutorService.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        payload: expect.objectContaining({
          idempotencyKey:
            'workspace-deletion:workspace-id:2026-08-18T10:00:00.000Z:application-retried',
        }),
      }),
    );
    expect(applicationRepository.update).toHaveBeenCalledTimes(1);
    expect(logicFunctionExecutorService.execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        payload: expect.objectContaining({
          idempotencyKey:
            'workspace-deletion:workspace-id:2026-08-18T10:00:00.000Z:application-retried',
        }),
      }),
    );
  });

  it('should record completion per application and skip already completed hooks', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');
    const pendingApplication = createApplication({ id: 'pending' });
    const completedApplication = createApplication({
      id: 'completed',
      uninstallHookCompletedForRequestedAt: workspaceDeletedAt,
    });

    applicationService.findManyApplications.mockResolvedValue([
      pendingApplication,
      completedApplication,
    ]);

    await createService().runUninstallHooksForWorkspaceDeletion({
      workspaceId: 'workspace-id',
      workspaceDeletedAt,
    });

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledTimes(1);
    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith(
      expect.objectContaining({ logicFunctionId: 'logic-function-pending' }),
    );
    expect(applicationRepository.update).toHaveBeenCalledTimes(1);
    expect(applicationRepository.update).toHaveBeenCalledWith('pending', {
      uninstallHookCompletedForRequestedAt: workspaceDeletedAt,
    });
  });

  it('should not record completion when the hook fails', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');

    applicationService.findManyApplications.mockResolvedValue([
      createApplication({ id: 'failing' }),
    ]);
    logicFunctionExecutorService.execute.mockResolvedValue({
      data: null,
      duration: 1,
      logs: '',
      status: LogicFunctionExecutionStatus.ERROR,
      error: {
        errorType: 'Error',
        errorMessage: 'cleanup failed',
        stackTrace: '',
      },
    });

    await expect(
      createService().runUninstallHooksForWorkspaceDeletion({
        workspaceId: 'workspace-id',
        workspaceDeletedAt,
      }),
    ).rejects.toThrow('cleanup failed');

    expect(applicationRepository.update).not.toHaveBeenCalled();
  });

  it('should report pending hooks only for uncovered uninstall requests', async () => {
    const uninstallRequestedAt = new Date('2026-08-18T10:00:00.000Z');

    applicationRepository.find.mockResolvedValue([
      Object.assign(
        createApplication({
          id: 'completed',
          uninstallHookCompletedForRequestedAt: uninstallRequestedAt,
        }),
        { workspaceId: 'covered-workspace-id' },
      ),
      Object.assign(createApplication({ id: 'pending' }), {
        workspaceId: 'pending-workspace-id',
      }),
    ]);

    await expect(
      createService().findWorkspaceIdsWithPendingUninstallHooks([
        {
          workspaceId: 'covered-workspace-id',
          uninstallRequestedAt,
        },
        {
          workspaceId: 'pending-workspace-id',
          uninstallRequestedAt,
        },
      ]),
    ).resolves.toEqual(new Set(['pending-workspace-id']));
    expect(applicationRepository.find).toHaveBeenCalledTimes(1);
  });
});
