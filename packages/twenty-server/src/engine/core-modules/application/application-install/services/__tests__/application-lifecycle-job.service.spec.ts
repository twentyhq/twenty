import { ApplicationLifecycleJobService } from 'src/engine/core-modules/application/application-install/services/application-lifecycle-job.service';
import type { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { TriggerUpgradeApplicationJob } from 'src/engine/core-modules/application/application-upgrade/jobs/trigger-upgrade-application.job';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import type { ApplicationService } from 'src/engine/core-modules/application/application.service';
import type { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import type { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

const WORKSPACE_ID = 'workspace-id';
const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const JOB_ID_SUFFIX = '5c98b035-5b09-4550-a4fb-b52056c494d1';

const buildJobId = (operation: string) =>
  `${operation}-application.${WORKSPACE_ID}.${UNIVERSAL_IDENTIFIER}-${JOB_ID_SUFFIX}`;

describe('ApplicationLifecycleJobService', () => {
  const applicationService = {
    findOneApplicationWithRelationsOrThrow: jest.fn(),
  } as unknown as ApplicationService;

  const marketplaceQueryService = {
    findRegistrationByUniversalIdentifier: jest
      .fn()
      .mockResolvedValue({ id: 'application-registration-id' }),
  } as unknown as MarketplaceQueryService;

  const cacheLockService = {
    withLock: jest.fn((callback: () => Promise<unknown>) => callback()),
  } as unknown as CacheLockService;

  const workspaceQueueService = {
    add: jest.fn(),
    getInFlightJobs: jest.fn(),
  } as unknown as MessageQueueService;

  const service = new ApplicationLifecycleJobService(
    applicationService,
    marketplaceQueryService,
    cacheLockService,
    workspaceQueueService,
  );

  const triggerUpgrade = () =>
    service.triggerUpgradeApplicationJob({
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      targetVersion: '2.0.0',
      workspaceId: WORKSPACE_ID,
    });

  const mockInFlightJobIds = (jobIds: string[]) =>
    jest
      .spyOn(workspaceQueueService, 'getInFlightJobs')
      .mockResolvedValue(jobIds.map((id) => ({ id, data: {} })));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enqueues the upgrade job when no lifecycle job is in flight', async () => {
    mockInFlightJobIds([]);
    jest
      .spyOn(workspaceQueueService, 'add')
      .mockResolvedValue(buildJobId('upgrade'));

    await expect(triggerUpgrade()).resolves.toEqual({
      jobId: buildJobId('upgrade'),
    });

    expect(workspaceQueueService.add).toHaveBeenCalledTimes(1);
    expect(workspaceQueueService.add).toHaveBeenCalledWith(
      TriggerUpgradeApplicationJob.name,
      {
        applicationRegistrationId: 'application-registration-id',
        targetVersion: '2.0.0',
        workspaceId: WORKSPACE_ID,
      },
      {
        id: `upgrade-application.${WORKSPACE_ID}.${UNIVERSAL_IDENTIFIER}`,
        broadcastTo: { workspaceId: WORKSPACE_ID },
      },
    );
  });

  it('returns the upgrade job already in flight instead of enqueuing a duplicate', async () => {
    mockInFlightJobIds([buildJobId('upgrade')]);

    await expect(triggerUpgrade()).resolves.toEqual({
      jobId: buildJobId('upgrade'),
    });

    expect(workspaceQueueService.add).not.toHaveBeenCalled();
  });

  it.each(['install', 'uninstall'])(
    'refuses to upgrade while the %s is in flight',
    async (conflictingOperation) => {
      mockInFlightJobIds([buildJobId(conflictingOperation)]);

      await expect(triggerUpgrade()).rejects.toMatchObject({
        message: `Cannot upgrade application ${UNIVERSAL_IDENTIFIER} while its ${conflictingOperation} is in progress`,
        code: ApplicationExceptionCode.INVALID_INPUT,
      });

      expect(workspaceQueueService.add).not.toHaveBeenCalled();
    },
  );
});
