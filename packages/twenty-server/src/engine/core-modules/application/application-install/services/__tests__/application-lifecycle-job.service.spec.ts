import { ApplicationLifecycleJobService } from 'src/engine/core-modules/application/application-install/services/application-lifecycle-job.service';
import { TriggerInstallApplicationJob } from 'src/engine/core-modules/application/application-install/jobs/trigger-install-application.job';
import { TriggerUninstallApplicationJob } from 'src/engine/core-modules/application/application-install/jobs/trigger-uninstall-application.job';
import type { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import type { ApplicationService } from 'src/engine/core-modules/application/application.service';
import type { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { JobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import type { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

const WORKSPACE_ID = 'workspace-id';
const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const SUFFIX = '5c98b035-5b09-4550-a4fb-b52056c494d1';
const INSTALL_JOB_ID_PREFIX = `install-application.${WORKSPACE_ID}.${UNIVERSAL_IDENTIFIER}`;
const UNINSTALL_JOB_ID_PREFIX = `uninstall-application.${WORKSPACE_ID}.${UNIVERSAL_IDENTIFIER}`;
const INSTALL_JOB_ID = `${INSTALL_JOB_ID_PREFIX}-${SUFFIX}`;
const UNINSTALL_JOB_ID = `${UNINSTALL_JOB_ID_PREFIX}-${SUFFIX}`;
const BROADCAST_TO = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: 'user-workspace-id',
};

describe('ApplicationLifecycleJobService', () => {
  const applicationService = {
    findOneApplicationOrThrow: jest.fn().mockResolvedValue({}),
  } as unknown as ApplicationService;
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

  const cacheLockService = {
    withLock: jest.fn((fn: () => Promise<unknown>) => fn()),
  } as unknown as CacheLockService;

  const service = new ApplicationLifecycleJobService(
    applicationService,
    marketplaceQueryService,
    cacheLockService,
    workspaceQueueService,
  );

  const target = {
    universalIdentifier: UNIVERSAL_IDENTIFIER,
    workspaceId: WORKSPACE_ID,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(workspaceQueueService, 'getInFlightJobs').mockResolvedValue([]);
    jest.spyOn(workspaceQueueService, 'getJobs').mockResolvedValue({});
  });

  describe('triggerInstallApplicationJob', () => {
    it('queues an installation deduplicated on the workspace and application prefix', async () => {
      jest
        .spyOn(workspaceQueueService, 'add')
        .mockResolvedValue(INSTALL_JOB_ID);

      const result = await service.triggerInstallApplicationJob({
        ...target,
        userWorkspaceId: 'user-workspace-id',
      });

      expect(result).toEqual({ jobId: INSTALL_JOB_ID });
      expect(cacheLockService.withLock).toHaveBeenCalledWith(
        expect.any(Function),
        `application-lifecycle-job:${WORKSPACE_ID}:${UNIVERSAL_IDENTIFIER}`,
      );
      expect(workspaceQueueService.add).toHaveBeenCalledWith(
        TriggerInstallApplicationJob.name,
        {
          applicationRegistrationId: 'application-registration-id',
          workspaceId: WORKSPACE_ID,
        },
        { id: INSTALL_JOB_ID_PREFIX, broadcastTo: BROADCAST_TO },
      );
    });

    it('reports the already waiting installation when the queue skips the add', async () => {
      jest.spyOn(workspaceQueueService, 'add').mockResolvedValue(undefined);
      jest.spyOn(workspaceQueueService, 'getInFlightJobs').mockResolvedValue([
        {
          id: `install-application.${WORKSPACE_ID}.other-application`,
          data: {},
        },
        { id: INSTALL_JOB_ID, data: {} },
      ]);

      expect(
        await service.triggerInstallApplicationJob({
          ...target,
          userWorkspaceId: 'user-workspace-id',
        }),
      ).toEqual({ jobId: INSTALL_JOB_ID });
    });

    it('refuses to queue an installation while an uninstallation is in flight', async () => {
      jest
        .spyOn(workspaceQueueService, 'getInFlightJobs')
        .mockResolvedValue([{ id: UNINSTALL_JOB_ID, data: {} }]);

      await expect(
        service.triggerInstallApplicationJob({
          ...target,
          userWorkspaceId: 'user-workspace-id',
        }),
      ).rejects.toThrow(
        `Cannot install application ${UNIVERSAL_IDENTIFIER} while its uninstall is in progress`,
      );
      expect(workspaceQueueService.add).not.toHaveBeenCalled();
    });

    it('fails when the queue skipped the add and no installation is in flight', async () => {
      jest.spyOn(workspaceQueueService, 'add').mockResolvedValue(undefined);

      await expect(
        service.triggerInstallApplicationJob({
          ...target,
          userWorkspaceId: 'user-workspace-id',
        }),
      ).rejects.toThrow(
        `Could not queue the install of application ${UNIVERSAL_IDENTIFIER}`,
      );
    });
  });

  describe('triggerUninstallApplicationJob', () => {
    it('queues an uninstallation of an installed application', async () => {
      jest
        .spyOn(workspaceQueueService, 'add')
        .mockResolvedValue(UNINSTALL_JOB_ID);

      const result = await service.triggerUninstallApplicationJob({
        ...target,
        userWorkspaceId: 'user-workspace-id',
      });

      expect(result).toEqual({ jobId: UNINSTALL_JOB_ID });
      expect(applicationService.findOneApplicationOrThrow).toHaveBeenCalledWith(
        target,
      );
      expect(workspaceQueueService.add).toHaveBeenCalledWith(
        TriggerUninstallApplicationJob.name,
        target,
        { id: UNINSTALL_JOB_ID_PREFIX, broadcastTo: BROADCAST_TO },
      );
    });

    it('refuses to queue an uninstallation while an installation is in flight', async () => {
      jest
        .spyOn(workspaceQueueService, 'getInFlightJobs')
        .mockResolvedValue([{ id: INSTALL_JOB_ID, data: {} }]);

      await expect(
        service.triggerUninstallApplicationJob({
          ...target,
          userWorkspaceId: 'user-workspace-id',
        }),
      ).rejects.toThrow(
        `Cannot uninstall application ${UNIVERSAL_IDENTIFIER} while its install is in progress`,
      );
      expect(workspaceQueueService.add).not.toHaveBeenCalled();
    });

    it('does not queue anything when the application is not installed', async () => {
      jest
        .spyOn(applicationService, 'findOneApplicationOrThrow')
        .mockRejectedValueOnce(new Error('Application not found'));

      await expect(
        service.triggerUninstallApplicationJob({
          ...target,
          userWorkspaceId: 'user-workspace-id',
        }),
      ).rejects.toThrow('Application not found');
      expect(workspaceQueueService.add).not.toHaveBeenCalled();
    });
  });

  describe('job status', () => {
    it('reads back the in-flight job of the requested operation only', async () => {
      jest.spyOn(workspaceQueueService, 'getInFlightJobs').mockResolvedValue([
        { id: INSTALL_JOB_ID, data: {} },
        { id: UNINSTALL_JOB_ID, data: {} },
      ]);
      jest.spyOn(workspaceQueueService, 'getJobs').mockResolvedValue({
        [UNINSTALL_JOB_ID]: {
          id: UNINSTALL_JOB_ID,
          data: {},
          state: 'active',
          attemptsMade: 1,
          timestamp: 1,
        },
      } as never);

      expect(await service.findUninstallApplicationJobStatus(target)).toEqual({
        jobId: UNINSTALL_JOB_ID,
        state: JobStateEnum.ACTIVE,
        attemptsMade: 1,
        failedReason: undefined,
        enqueuedAt: 1,
        startedAt: undefined,
        finishedAt: undefined,
      });
      expect(workspaceQueueService.getJobs).toHaveBeenCalledWith([
        UNINSTALL_JOB_ID,
      ]);
    });

    it('reads back a tracked job whatever its state', async () => {
      jest.spyOn(workspaceQueueService, 'getJobs').mockResolvedValue({
        [INSTALL_JOB_ID]: {
          id: INSTALL_JOB_ID,
          data: {},
          state: 'completed',
          attemptsMade: 1,
          timestamp: 1,
          processedOn: 2,
          finishedOn: 3,
        },
      } as never);

      expect(
        await service.findInstallApplicationJobStatus({
          ...target,
          jobId: INSTALL_JOB_ID,
        }),
      ).toEqual({
        jobId: INSTALL_JOB_ID,
        state: JobStateEnum.COMPLETED,
        attemptsMade: 1,
        failedReason: undefined,
        enqueuedAt: 1,
        startedAt: 2,
        finishedAt: 3,
      });
      expect(workspaceQueueService.getInFlightJobs).not.toHaveBeenCalled();
    });

    it('ignores a tracked job id that does not belong to the application', async () => {
      expect(
        await service.findInstallApplicationJobStatus({
          ...target,
          jobId: `install-application.other-workspace.${UNIVERSAL_IDENTIFIER}-${SUFFIX}`,
        }),
      ).toBeNull();
      expect(workspaceQueueService.getJobs).not.toHaveBeenCalled();
    });

    it('returns no status when no job of the operation is in flight', async () => {
      jest
        .spyOn(workspaceQueueService, 'getInFlightJobs')
        .mockResolvedValue([{ id: UNINSTALL_JOB_ID, data: {} }]);

      expect(await service.findInstallApplicationJobStatus(target)).toBeNull();
      expect(workspaceQueueService.getJobs).not.toHaveBeenCalled();
    });
  });
});
