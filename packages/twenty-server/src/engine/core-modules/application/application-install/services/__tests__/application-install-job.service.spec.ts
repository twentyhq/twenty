import { ApplicationInstallJobService } from 'src/engine/core-modules/application/application-install/services/application-install-job.service';
import { TriggerInstallApplicationJob } from 'src/engine/core-modules/application/application-install/jobs/trigger-install-application.job';
import type { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { JobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import type { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

const WORKSPACE_ID = 'workspace-id';
const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const JOB_ID_PREFIX = `install-application.${WORKSPACE_ID}.${UNIVERSAL_IDENTIFIER}`;
const QUEUED_JOB_ID = `${JOB_ID_PREFIX}-5c98b035-5b09-4550-a4fb-b52056c494d1`;

describe('ApplicationInstallJobService', () => {
  const marketplaceQueryService = {
    findRegistrationByUniversalIdentifier: jest
      .fn()
      .mockResolvedValue({ id: 'application-registration-id' }),
  } as unknown as MarketplaceQueryService;
  const workspaceQueueService = {
    add: jest.fn(),
    getJobs: jest.fn(),
    getInFlightJobs: jest.fn(),
  } as unknown as MessageQueueService;

  const service = new ApplicationInstallJobService(
    marketplaceQueryService,
    workspaceQueueService,
  );

  const triggerInstall = () =>
    service.triggerInstallApplicationJob({
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: 'user-workspace-id',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(workspaceQueueService, 'add').mockResolvedValue(QUEUED_JOB_ID);
    jest.spyOn(workspaceQueueService, 'getInFlightJobs').mockResolvedValue([]);
    jest.spyOn(workspaceQueueService, 'getJobs').mockResolvedValue({});
  });

  it('queues an installation deduplicated on the workspace and application prefix', async () => {
    const result = await triggerInstall();

    expect(result).toEqual({ jobId: QUEUED_JOB_ID });
    expect(workspaceQueueService.add).toHaveBeenCalledWith(
      TriggerInstallApplicationJob.name,
      {
        applicationRegistrationId: 'application-registration-id',
        workspaceId: WORKSPACE_ID,
      },
      {
        id: JOB_ID_PREFIX,
        broadcastTo: {
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'user-workspace-id',
        },
      },
    );
  });

  it('reports the already waiting installation when the queue skips the add', async () => {
    jest.spyOn(workspaceQueueService, 'add').mockResolvedValue(undefined);
    jest.spyOn(workspaceQueueService, 'getInFlightJobs').mockResolvedValue([
      { id: 'other-job-id', data: {} },
      { id: QUEUED_JOB_ID, data: {} },
    ]);

    expect(await triggerInstall()).toEqual({ jobId: QUEUED_JOB_ID });
  });

  it('fails when the queue skipped the add and no installation is in flight', async () => {
    jest.spyOn(workspaceQueueService, 'add').mockResolvedValue(undefined);

    await expect(triggerInstall()).rejects.toThrow(
      `Could not queue the installation of application ${UNIVERSAL_IDENTIFIER}`,
    );
  });

  it('reads back the status of the in-flight installation job', async () => {
    jest
      .spyOn(workspaceQueueService, 'getInFlightJobs')
      .mockResolvedValue([{ id: QUEUED_JOB_ID, data: {} }]);
    jest.spyOn(workspaceQueueService, 'getJobs').mockResolvedValue({
      [QUEUED_JOB_ID]: {
        id: QUEUED_JOB_ID,
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
      jobId: QUEUED_JOB_ID,
      state: JobStateEnum.ACTIVE,
      attemptsMade: 1,
      failedReason: undefined,
      enqueuedAt: 1,
      startedAt: undefined,
      finishedAt: undefined,
    });
    expect(workspaceQueueService.getJobs).toHaveBeenCalledWith([QUEUED_JOB_ID]);
  });

  it('returns no status when no installation of the application is in flight', async () => {
    jest
      .spyOn(workspaceQueueService, 'getInFlightJobs')
      .mockResolvedValue([{ id: 'other-job-id', data: {} }]);

    expect(
      await service.findInstallApplicationJobStatus({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
      }),
    ).toBeNull();
    expect(workspaceQueueService.getJobs).not.toHaveBeenCalled();
  });
});
