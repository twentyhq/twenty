import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

import { ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

describe('ApplicationUninstallService', () => {
  const applicationService = {
    findManyApplications: jest.fn(),
  };
  const logicFunctionExecutorService = {
    execute: jest.fn(),
  };

  const createService = () =>
    new ApplicationUninstallService(
      applicationService as unknown as ApplicationService,
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
    );

  const createApplication = ({ id }: { id: string }) =>
    Object.assign(new ApplicationEntity(), {
      id,
      universalIdentifier: `application-${id}`,
      uninstallLogicFunctionId: `logic-function-${id}`,
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

  it('should reuse the idempotency key when retrying the same workspace request', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');

    applicationService.findManyApplications.mockResolvedValue([
      createApplication({ id: 'retried' }),
    ]);

    const applicationUninstallService = createService();

    await applicationUninstallService.runUninstallHooksForWorkspaceDeletion({
      workspaceId: 'workspace-id',
      workspaceDeletedAt,
    });
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

  it('should omit deletion credentials when handling workspace suspension', async () => {
    const workspaceSuspendedAt = new Date('2026-08-18T10:00:00.000Z');

    applicationService.findManyApplications.mockResolvedValue([
      createApplication({ id: 'suspended' }),
    ]);

    await createService().runUninstallHooksForWorkspaceSuspension({
      workspaceId: 'workspace-id',
      workspaceSuspendedAt,
    });

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith({
      logicFunctionId: 'logic-function-suspended',
      workspaceId: 'workspace-id',
      payload: {
        version: '1.0.0',
        idempotencyKey:
          'workspace-suspension:workspace-id:2026-08-18T10:00:00.000Z:application-suspended',
      },
    });
  });
});
