import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { SERVER_CRON_CATCH_UP_WINDOW_MS } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-catch-up-window-ms.constant';
import { SERVER_CRON_FIRE_TIME_LOCK_TTL_MS } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-fire-time-lock-ttl-ms.constant';
import { SERVER_CRON_STEP_RETRY_LIMIT } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-step-retry-limit.constant';
import { ServerCronTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/jobs/server-cron-trigger.job';
import { type ServerCronTriggerJobData } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/types/server-cron-trigger-job-data.type';
import { buildServerCronStepJobId } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/utils/build-server-cron-step-job-id.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const SERVER_CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class ServerCronTriggerCronJob {
  private readonly logger = new Logger(ServerCronTriggerCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectWorkspaceScopedRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: WorkspaceScopedRepository<LogicFunctionEntity>,
    private readonly cronTriggerDeduplicationService: CronTriggerDeduplicationService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly metricsService: MetricsService,
  ) {}

  @Process(ServerCronTriggerCronJob.name)
  @SentryCronMonitor(
    ServerCronTriggerCronJob.name,
    SERVER_CRON_TRIGGER_CRON_PATTERN,
  )
  async handle() {
    const serverCronLogicFunctions = await this.findServerCronLogicFunctions();
    const now = new Date();

    for (const logicFunction of serverCronLogicFunctions) {
      try {
        await this.dispatchIfDue({ logicFunction, now });
      } catch (error) {
        this.logger.error(
          `Error dispatching server cron logic function ${logicFunction.id}: ${error}`,
        );
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: logicFunction.workspaceId },
        });
      }
    }
  }

  private async findServerCronLogicFunctions(): Promise<LogicFunctionEntity[]> {
    return this.logicFunctionRepository
      .createQueryBuilder('logicFunction')
      .innerJoin('logicFunction.application', 'application')
      .innerJoin(
        'application.applicationRegistration',
        'applicationRegistration',
      )
      .innerJoin('logicFunction.workspace', 'workspace')
      .select([
        'logicFunction.id',
        'logicFunction.workspaceId',
        'logicFunction.universalIdentifier',
        'logicFunction.serverCronTriggerSettings',
        'application.id',
        'application.applicationRegistrationId',
        'workspace.id',
        'workspace.activationStatus',
      ])
      .where('logicFunction.serverCronTriggerSettings IS NOT NULL')
      .andWhere(
        'logicFunction.workspaceId = applicationRegistration.ownerWorkspaceId',
      )
      .getMany();
  }

  private async dispatchIfDue({
    logicFunction,
    now,
  }: {
    logicFunction: LogicFunctionEntity;
    now: Date;
  }): Promise<void> {
    const applicationRegistrationId =
      logicFunction.application.applicationRegistrationId;
    const pattern = logicFunction.serverCronTriggerSettings?.pattern;

    if (!isDefined(applicationRegistrationId) || !isDefined(pattern)) {
      return;
    }

    const keyPrefix = `logic-function-server-cron:${applicationRegistrationId}:${logicFunction.universalIdentifier}`;

    const scheduledAtEpochMs =
      await this.cronTriggerDeduplicationService.acquireDueUtcFireTime({
        keyPrefix,
        pattern,
        now,
        catchUpWindowMs: SERVER_CRON_CATCH_UP_WINDOW_MS,
        lockTtlMs: SERVER_CRON_FIRE_TIME_LOCK_TTL_MS,
      });

    if (!isDefined(scheduledAtEpochMs)) {
      return;
    }

    if (
      logicFunction.workspace.activationStatus !==
      WorkspaceActivationStatus.ACTIVE
    ) {
      this.logger.warn(
        `Skipping server cron logic function ${logicFunction.universalIdentifier} of application registration ${applicationRegistrationId}: owner workspace ${logicFunction.workspaceId} is ${logicFunction.workspace.activationStatus}`,
      );
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.ServerCronTickSkipped,
        amount: 1,
        attributes: {
          application_registration_id: applicationRegistrationId,
          reason: 'owner-workspace-not-active',
        },
      });

      return;
    }

    const firstStepJobData: ServerCronTriggerJobData = {
      workspaceId: logicFunction.workspaceId,
      logicFunctionId: logicFunction.id,
      logicFunctionUniversalIdentifier: logicFunction.universalIdentifier,
      applicationRegistrationId,
      scheduledAtEpochMs,
      step: 0,
    };

    try {
      await this.messageQueueService.bulkAdd<ServerCronTriggerJobData>(
        ServerCronTriggerJob.name,
        [
          {
            data: firstStepJobData,
            jobId: buildServerCronStepJobId(firstStepJobData),
          },
        ],
        {
          retryLimit: SERVER_CRON_STEP_RETRY_LIMIT,
          backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
          allowDuplicatedPrefixes: true,
        },
      );
    } catch (error) {
      await this.cronTriggerDeduplicationService.releaseFireTime({
        keyPrefix,
        fireTimestamp: scheduledAtEpochMs,
      });

      throw error;
    }
  }
}
