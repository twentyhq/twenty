import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ServerCronTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/jobs/server-cron-trigger.job';
import { ServerCronTriggerCronJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/server-cron-trigger.cron.job';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const SCHEDULED_AT_EPOCH_MS = Date.parse('2026-09-23T04:30:00.000Z');

const buildServerCronLogicFunction = ({
  activationStatus = WorkspaceActivationStatus.ACTIVE,
}: {
  activationStatus?: WorkspaceActivationStatus;
} = {}) =>
  ({
    id: 'dispatcher-logic-function-id',
    workspaceId: 'owner-workspace-id',
    universalIdentifier: 'dispatcher-universal-id',
    serverCronTriggerSettings: { pattern: '30 4 * * *' },
    application: {
      id: 'application-id',
      applicationRegistrationId: 'registration-1',
    },
    workspace: { id: 'owner-workspace-id', activationStatus },
  }) as unknown as LogicFunctionEntity;

describe('ServerCronTriggerCronJob', () => {
  const getMany = jest.fn();
  const queryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany,
  };
  const bulkAdd = jest.fn();
  const acquireDueUtcFireTime = jest.fn();
  const releaseFireTime = jest.fn();
  const captureExceptions = jest.fn();
  const incrementCounterBy = jest.fn();

  const cronJob = new ServerCronTriggerCronJob(
    { bulkAdd } as unknown as MessageQueueService,
    {
      createQueryBuilder: () => queryBuilder,
    } as unknown as WorkspaceScopedRepository<LogicFunctionEntity>,
    {
      acquireDueUtcFireTime,
      releaseFireTime,
    } as unknown as CronTriggerDeduplicationService,
    { captureExceptions } as unknown as ExceptionHandlerService,
    { incrementCounterBy } as unknown as MetricsService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    getMany.mockResolvedValue([buildServerCronLogicFunction()]);
    acquireDueUtcFireTime.mockResolvedValue(SCHEDULED_AT_EPOCH_MS);
  });

  it('only looks up server cron functions in their owner workspace', async () => {
    await cronJob.handle();

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'logicFunction.serverCronTriggerSettings IS NOT NULL',
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'logicFunction.workspaceId = applicationRegistration.ownerWorkspaceId',
    );
  });

  it('enqueues the first step once per due fire time', async () => {
    await cronJob.handle();

    expect(acquireDueUtcFireTime).toHaveBeenCalledWith(
      expect.objectContaining({
        keyPrefix:
          'logic-function-server-cron:registration-1:dispatcher-universal-id',
        pattern: '30 4 * * *',
      }),
    );
    expect(bulkAdd).toHaveBeenCalledWith(
      ServerCronTriggerJob.name,
      [
        {
          data: {
            workspaceId: 'owner-workspace-id',
            logicFunctionId: 'dispatcher-logic-function-id',
            logicFunctionUniversalIdentifier: 'dispatcher-universal-id',
            applicationRegistrationId: 'registration-1',
            scheduledAtEpochMs: SCHEDULED_AT_EPOCH_MS,
            step: 0,
          },
          jobId: `server-cron.registration-1.dispatcher-universal-id.${SCHEDULED_AT_EPOCH_MS}.0`,
        },
      ],
      expect.objectContaining({ allowDuplicatedPrefixes: true }),
    );
  });

  it('does nothing when the function is not due', async () => {
    acquireDueUtcFireTime.mockResolvedValue(undefined);

    await cronJob.handle();

    expect(bulkAdd).not.toHaveBeenCalled();
  });

  it('skips the tick when the owner workspace is not active', async () => {
    getMany.mockResolvedValue([
      buildServerCronLogicFunction({
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      }),
    ]);

    await cronJob.handle();

    expect(bulkAdd).not.toHaveBeenCalled();
    expect(incrementCounterBy).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'server-cron/tick-skipped',
        attributes: expect.objectContaining({
          reason: 'owner-workspace-not-active',
        }),
      }),
    );
  });

  it('releases the fire time when the enqueue fails so the next tick retries', async () => {
    getMany.mockResolvedValue([
      buildServerCronLogicFunction(),
      {
        ...buildServerCronLogicFunction(),
        id: 'other-dispatcher-id',
        universalIdentifier: 'other-dispatcher-universal-id',
      },
    ]);
    bulkAdd.mockRejectedValueOnce(new Error('redis down'));

    await cronJob.handle();

    expect(releaseFireTime).toHaveBeenCalledWith({
      keyPrefix:
        'logic-function-server-cron:registration-1:dispatcher-universal-id',
      fireTimestamp: SCHEDULED_AT_EPOCH_MS,
    });
    expect(captureExceptions).toHaveBeenCalledTimes(1);
    expect(bulkAdd).toHaveBeenCalledTimes(2);
  });
});
