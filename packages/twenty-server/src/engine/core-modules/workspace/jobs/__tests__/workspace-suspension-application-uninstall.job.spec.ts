import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import { type PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { type ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { WorkspaceSuspensionApplicationUninstallJob } from 'src/engine/core-modules/workspace/jobs/workspace-suspension-application-uninstall.job';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceException } from 'src/engine/core-modules/workspace/workspace.exception';

describe('WorkspaceSuspensionApplicationUninstallJob', () => {
  const workspaceRepository = {
    findOne: jest.fn(),
  };
  const applicationUninstallService = {
    runUninstallHooksForWorkspaceSuspension: jest.fn(),
  };
  const postgresAdvisoryLockService = {
    tryWithLock: jest.fn(),
  };

  const createJob = () =>
    new WorkspaceSuspensionApplicationUninstallJob(
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      applicationUninstallService as unknown as ApplicationUninstallService,
      postgresAdvisoryLockService as unknown as PostgresAdvisoryLockService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    postgresAdvisoryLockService.tryWithLock.mockImplementation(
      async (_lockName, callback) => ({
        acquired: true,
        value: await callback(),
      }),
    );
  });

  it('should run hooks when the suspension request is still current', async () => {
    const workspaceSuspensionUninstallRequestedAt = new Date(
      '2026-08-18T10:00:00.000Z',
    );

    workspaceRepository.findOne.mockResolvedValue(
      Object.assign(new WorkspaceEntity(), {
        id: 'workspace-id',
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
        deletedAt: null,
        suspendedAt: workspaceSuspensionUninstallRequestedAt,
      }),
    );

    await createJob().handle({
      workspaceId: 'workspace-id',
      workspaceSuspensionUninstallRequestedAt:
        workspaceSuspensionUninstallRequestedAt.toISOString(),
    });

    expect(
      applicationUninstallService.runUninstallHooksForWorkspaceSuspension,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workspaceSuspendedAt: workspaceSuspensionUninstallRequestedAt,
    });
  });

  it('should skip hooks when the workspace has since been reactivated', async () => {
    workspaceRepository.findOne.mockResolvedValue(
      Object.assign(new WorkspaceEntity(), {
        id: 'workspace-id',
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        deletedAt: null,
        suspendedAt: null,
      }),
    );

    await createJob().handle({
      workspaceId: 'workspace-id',
      workspaceSuspensionUninstallRequestedAt: '2026-08-18T10:00:00.000Z',
    });

    expect(
      applicationUninstallService.runUninstallHooksForWorkspaceSuspension,
    ).not.toHaveBeenCalled();
  });

  it('should retry later when another uninstall job holds the workspace lock', async () => {
    postgresAdvisoryLockService.tryWithLock.mockResolvedValue({
      acquired: false,
    });

    await expect(
      createJob().handle({
        workspaceId: 'workspace-id',
        workspaceSuspensionUninstallRequestedAt: '2026-08-18T10:00:00.000Z',
      }),
    ).rejects.toThrow(WorkspaceException);
  });
});
