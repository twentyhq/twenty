import { ApplicationInstallJobService } from 'src/engine/core-modules/application/application-install/services/application-install-job.service';
import { TriggerInstallApplicationJob } from 'src/engine/core-modules/application/application-install/jobs/trigger-install-application.job';
import type { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { JobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import type { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

const WORKSPACE_ID = 'workspace-id';
const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const JOB_ID = `install-application.${WORKSPACE_ID}.${UNIVERSAL_IDENTIFIER}`;

describe('ApplicationInstallJobService', () => {
  const marketplaceQueryService = {
    findRegistrationByUniversalIdentifier: jest
      .fn()
      .mockResolvedValue({ id: 'application-registration-id' }),
  } as unknown as MarketplaceQueryService;
  const workspaceQueueService = {
    bulkAdd: jest.fn(),
    getJobs: jest.fn().mockResolvedValue({}),
  } as unknown as MessageQueueService;

  const service = new ApplicationInstallJobService(
    marketplaceQueryService,
    workspaceQueueService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(workspaceQueueService, 'getJobs').mockResolvedValue({});
  });

  it('queues an installation under a job id derived from the workspace and the application', async () => {
    const result = await service.triggerInstallApplicationJob({
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: 'user-workspace-id',
    });

    expect(result).toEqual({ jobId: JOB_ID });
    expect(workspaceQueueService.bulkAdd).toHaveBeenCalledWith(
      TriggerInstallApplicationJob.name,
      [
        {
          data: {
            applicationRegistrationId: 'application-registration-id',
            workspaceId: WORKSPACE_ID,
          },
          jobId: JOB_ID,
        },
      ],
      {
        broadcastTo: {
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'user-workspace-id',
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  });

  it('reads back the status of the installation job of an application', async () => {
    jest.spyOn(workspaceQueueService, 'getJobs').mockResolvedValue({
      [JOB_ID]: {
        id: JOB_ID,
        data: {},
        state: 'active',
        attemptsMade: 1,
        timestamp: 1,
      },
    } as never);

    expect(
      await service.findInstallApplicationJobStatus({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({
      jobId: JOB_ID,
      state: JobStateEnum.ACTIVE,
      attemptsMade: 1,
      failedReason: undefined,
      enqueuedAt: 1,
      startedAt: undefined,
      finishedAt: undefined,
    });
  });

  it('returns no status when the application was never installed', async () => {
    expect(
      await service.findInstallApplicationJobStatus({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
      }),
    ).toBeNull();
  });
});
