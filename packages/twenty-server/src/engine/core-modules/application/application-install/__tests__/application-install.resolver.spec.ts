import { ApplicationInstallResolver } from 'src/engine/core-modules/application/application-install/application-install.resolver';
import { TriggerInstallApplicationJob } from 'src/engine/core-modules/application/application-install/jobs/trigger-install-application.job';
import type { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import type { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('ApplicationInstallResolver', () => {
  const marketplaceQueryService = {
    findRegistrationByUniversalIdentifier: jest.fn(),
  } as unknown as MarketplaceQueryService;
  const workspaceQueueService = {
    bulkAdd: jest.fn(),
  } as unknown as MessageQueueService;
  const resolver = new ApplicationInstallResolver(
    null as never,
    null as never,
    null as never,
    marketplaceQueryService,
    null as never,
    workspaceQueueService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('queues an installation with the caller-provided job id', async () => {
    jest
      .spyOn(marketplaceQueryService, 'findRegistrationByUniversalIdentifier')
      .mockResolvedValue({ id: 'application-registration-id' } as never);

    const result = await resolver.triggerInstallApplicationJob(
      {
        universalIdentifier: 'application-universal-identifier',
        version: '1.0.0',
        jobId: '5c98b035-5b09-4550-a4fb-b52056c494d1',
      },
      { id: 'workspace-id' } as WorkspaceEntity,
      'user-workspace-id',
    );

    expect(result).toEqual({
      jobId: '5c98b035-5b09-4550-a4fb-b52056c494d1',
    });
    expect(workspaceQueueService.bulkAdd).toHaveBeenCalledWith(
      TriggerInstallApplicationJob.name,
      [
        {
          data: {
            applicationRegistrationId: 'application-registration-id',
            version: '1.0.0',
            workspaceId: 'workspace-id',
          },
          jobId: '5c98b035-5b09-4550-a4fb-b52056c494d1',
        },
      ],
      {
        broadcastTo: {
          workspaceId: 'workspace-id',
          userWorkspaceId: 'user-workspace-id',
        },
      },
    );
  });
});
