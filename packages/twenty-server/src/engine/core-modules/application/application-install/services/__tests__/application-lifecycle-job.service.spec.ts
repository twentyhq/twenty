import { Test } from '@nestjs/testing';

import { ApplicationLifecycleJobService } from 'src/engine/core-modules/application/application-install/services/application-lifecycle-job.service';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { TriggerUpgradeApplicationJob } from 'src/engine/core-modules/application/application-upgrade/jobs/trigger-upgrade-application.job';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';

const WORKSPACE_ID = 'workspace-id';
const UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const JOB_ID_SUFFIX = '5c98b035-5b09-4550-a4fb-b52056c494d1';

const buildJobId = (operation: string) =>
  `${operation}-application.${WORKSPACE_ID}.${UNIVERSAL_IDENTIFIER}-${JOB_ID_SUFFIX}`;

describe('ApplicationLifecycleJobService', () => {
  const applicationService = {
    findOneApplicationWithRelationsOrThrow: jest.fn(),
  };

  const marketplaceQueryService = {
    findRegistrationByUniversalIdentifier: jest
      .fn()
      .mockResolvedValue({ id: 'application-registration-id' }),
  };

  const cacheLockService = {
    withLock: jest.fn((callback: () => Promise<unknown>) => callback()),
  };

  const workspaceQueueService = {
    add: jest.fn(),
    getInFlightJobs: jest.fn(),
  };

  let service: ApplicationLifecycleJobService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ApplicationLifecycleJobService,
        { provide: ApplicationService, useValue: applicationService },
        { provide: MarketplaceQueryService, useValue: marketplaceQueryService },
        { provide: CacheLockService, useValue: cacheLockService },
        {
          provide: getQueueToken(MessageQueue.workspaceQueue),
          useValue: workspaceQueueService,
        },
      ],
    }).compile();

    service = module.get(ApplicationLifecycleJobService);
  });

  const triggerUpgrade = () =>
    service.triggerUpgradeApplication({
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
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: UNIVERSAL_IDENTIFIER,
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
