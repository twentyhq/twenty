import { WorkspaceDeletionApplicationUninstallJob } from 'src/engine/core-modules/workspace/jobs/workspace-deletion-application-uninstall.job';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

describe('WorkspaceService deletion lifecycle', () => {
  const workspaceRepository = {
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };
  const userWorkspaceRepository = {
    find: jest.fn(),
  };
  const billingService = {
    isBillingEnabled: jest.fn(),
  };
  const coreEntityCacheService = {
    invalidate: jest.fn(),
  };
  const messageQueueService = {
    add: jest.fn(),
  };

  const createService = () => {
    const service = Object.create(WorkspaceService.prototype);

    Object.assign(service, {
      workspaceRepository,
      userWorkspaceRepository,
      billingService,
      coreEntityCacheService,
      messageQueueService,
      logger: { log: jest.fn() },
    });

    return service as WorkspaceService;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    billingService.isBillingEnabled.mockReturnValue(false);
    userWorkspaceRepository.find.mockResolvedValue([]);
  });

  it('acknowledges soft deletion by queuing retryable uninstall hooks', async () => {
    workspaceRepository.findOne.mockResolvedValue({
      id: 'workspace-id',
      deletedAt: null,
    });

    await createService().deleteWorkspace('workspace-id', true);

    expect(workspaceRepository.softDelete).toHaveBeenCalledWith({
      id: 'workspace-id',
    });
    expect(messageQueueService.add).toHaveBeenCalledWith(
      WorkspaceDeletionApplicationUninstallJob.name,
      { workspaceId: 'workspace-id' },
      {
        id: `${WorkspaceDeletionApplicationUninstallJob.name}-workspace-id`,
        retryLimit: 3,
      },
    );
  });

  it('refuses hard deletion until application uninstall hooks complete', async () => {
    workspaceRepository.findOne.mockResolvedValue({
      id: 'workspace-id',
      deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      applicationUninstallHooksCompletedAt: null,
    });

    await expect(
      createService().deleteWorkspace('workspace-id'),
    ).rejects.toThrow(
      'Application uninstall hooks must complete before hard deleting workspace workspace-id',
    );

    expect(userWorkspaceRepository.find).not.toHaveBeenCalled();
  });
});
