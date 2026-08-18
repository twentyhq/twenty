import { type Repository } from 'typeorm';

import { type PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { type ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { WorkspaceDeletionApplicationUninstallJob } from 'src/engine/core-modules/workspace/jobs/workspace-deletion-application-uninstall.job';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('WorkspaceDeletionApplicationUninstallJob', () => {
  const workspaceRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const applicationSyncService = {
    runUninstallHooksForWorkspaceApplications: jest.fn(),
  };
  const postgresAdvisoryLockService = {
    tryWithLock: jest.fn(),
  };

  const createJob = () =>
    new WorkspaceDeletionApplicationUninstallJob(
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      applicationSyncService as unknown as ApplicationSyncService,
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

  it('marks uninstall hooks complete only after the entire batch succeeds', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');

    workspaceRepository.findOne.mockResolvedValue({
      id: 'workspace-id',
      deletedAt: workspaceDeletedAt,
      applicationUninstallHooksCompletedAt: null,
    });
    applicationSyncService.runUninstallHooksForWorkspaceApplications.mockResolvedValue(
      undefined,
    );

    await createJob().handle({ workspaceId: 'workspace-id' });

    expect(
      applicationSyncService.runUninstallHooksForWorkspaceApplications,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workspaceDeletedAt,
    });
    expect(workspaceRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'workspace-id',
        deletedAt: workspaceDeletedAt,
      }),
      {
        applicationUninstallHooksCompletedAt: expect.any(Date),
      },
    );
  });

  it('leaves the workspace pending when an uninstall hook fails', async () => {
    workspaceRepository.findOne.mockResolvedValue({
      id: 'workspace-id',
      deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      applicationUninstallHooksCompletedAt: null,
    });
    applicationSyncService.runUninstallHooksForWorkspaceApplications.mockRejectedValue(
      new Error('cleanup failed'),
    );

    await expect(
      createJob().handle({ workspaceId: 'workspace-id' }),
    ).rejects.toThrow('cleanup failed');

    expect(workspaceRepository.update).not.toHaveBeenCalled();
  });
});
