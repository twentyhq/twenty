import { type Repository } from 'typeorm';

import { type PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { type ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { WorkspaceDeletionApplicationUninstallJob } from 'src/engine/core-modules/workspace/jobs/workspace-deletion-application-uninstall.job';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceException } from 'src/engine/core-modules/workspace/workspace.exception';

describe('WorkspaceDeletionApplicationUninstallJob', () => {
  const workspaceRepository = {
    findOne: jest.fn(),
  };
  const applicationUninstallService = {
    runUninstallHooksForWorkspaceDeletion: jest.fn(),
  };
  const postgresAdvisoryLockService = {
    tryWithLock: jest.fn(),
  };

  const createJob = () =>
    new WorkspaceDeletionApplicationUninstallJob(
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

  it('should run hooks for the pending deletion request', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');

    workspaceRepository.findOne.mockResolvedValue(
      Object.assign(new WorkspaceEntity(), {
        id: 'workspace-id',
        deletedAt: workspaceDeletedAt,
      }),
    );

    await createJob().handle({ workspaceId: 'workspace-id' });

    expect(workspaceRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'workspace-id' },
      withDeleted: true,
    });
    expect(
      applicationUninstallService.runUninstallHooksForWorkspaceDeletion,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workspaceDeletedAt,
    });
  });

  it('should skip hooks when the workspace is no longer soft deleted', async () => {
    workspaceRepository.findOne.mockResolvedValue(
      Object.assign(new WorkspaceEntity(), {
        id: 'workspace-id',
        deletedAt: null,
      }),
    );

    await createJob().handle({ workspaceId: 'workspace-id' });

    expect(
      applicationUninstallService.runUninstallHooksForWorkspaceDeletion,
    ).not.toHaveBeenCalled();
  });

  it('should retry later when another uninstall job holds the workspace lock', async () => {
    postgresAdvisoryLockService.tryWithLock.mockResolvedValue({
      acquired: false,
    });

    await expect(
      createJob().handle({ workspaceId: 'workspace-id' }),
    ).rejects.toThrow(WorkspaceException);
  });
});
