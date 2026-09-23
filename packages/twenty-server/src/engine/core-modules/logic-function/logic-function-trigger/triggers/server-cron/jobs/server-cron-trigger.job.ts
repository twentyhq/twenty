import { Logger, Scope } from '@nestjs/common';

import { type ServerCronPayload } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ENQUEUE_JOB_PRIORITY } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-priority.constant';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { LogicFunctionJobRunnerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { SERVER_CRON_DISPATCH_RETRY_LIMIT } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-dispatch-retry-limit.constant';
import { SERVER_CRON_MAX_STEPS_PER_TICK } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-steps-per-tick.constant';
import { SERVER_CRON_STEP_DONE_MARKER_TTL_MS } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-step-done-marker-ttl-ms.constant';
import { SERVER_CRON_STEP_RETRY_LIMIT } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-step-retry-limit.constant';
import { ServerCronDispatchRateLimiterService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/services/server-cron-dispatch-rate-limiter.service';
import {
  type ResolvedServerCronDispatch,
  ServerCronDispatchTargetResolverService,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/services/server-cron-dispatch-target-resolver.service';
import { type ServerCronTriggerJobData } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/types/server-cron-trigger-job-data.type';
import { buildServerCronDispatchJobId } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/utils/build-server-cron-dispatch-job-id.util';
import { buildServerCronStepJobId } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/utils/build-server-cron-step-job-id.util';
import { parseServerCronDispatchResult } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/utils/parse-server-cron-dispatch-result.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobRetryContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Processor({
  queueName: MessageQueue.logicFunctionQueue,
  scope: Scope.REQUEST,
})
export class ServerCronTriggerJob {
  private readonly logger = new Logger(ServerCronTriggerJob.name);

  constructor(
    private readonly logicFunctionJobRunnerService: LogicFunctionJobRunnerService,
    private readonly serverCronDispatchTargetResolverService: ServerCronDispatchTargetResolverService,
    private readonly serverCronDispatchRateLimiterService: ServerCronDispatchRateLimiterService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly metricsService: MetricsService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  @Process(ServerCronTriggerJob.name)
  async handle(
    jobData: ServerCronTriggerJobData,
    jobContext: MessageQueueJobRetryContext<ServerCronTriggerJobData>,
  ): Promise<void> {
    const stepJobId = buildServerCronStepJobId(jobData);
    const stepDoneMarkerKey = `logic-function-server-cron-step-done:${stepJobId}`;

    if (isDefined(await this.cacheStorageService.get(stepDoneMarkerKey))) {
      return;
    }

    if (!(await this.isServerCronLogicFunctionActive(jobData))) {
      this.recordStepFailure({
        jobData,
        reason: 'logic-function-not-found',
        errorMessage: 'the logic function or its server cron trigger is gone',
      });

      return;
    }

    const handlerResultData = await this.runHandler({ jobData, jobContext });

    if (!isDefined(handlerResultData)) {
      return;
    }

    const parseOutcome = parseServerCronDispatchResult(handlerResultData.data);

    if (!parseOutcome.isValid) {
      this.recordStepFailure({
        jobData,
        reason: 'invalid-result',
        errorMessage: parseOutcome.errorMessage,
      });

      return;
    }

    const { dispatches, next } = parseOutcome.dispatchResult;

    const { resolvedDispatches, droppedDispatches } =
      await this.serverCronDispatchTargetResolverService.resolveDispatchTargets(
        {
          applicationRegistrationId: jobData.applicationRegistrationId,
          dispatches,
        },
      );

    await this.enqueueDispatches({ jobData, stepJobId, resolvedDispatches });

    if (isDefined(next)) {
      await this.enqueueNextStep({
        jobData,
        cursor: next.cursor,
        delayMs: next.delayMs,
      });
    }

    await this.cacheStorageService.set(
      stepDoneMarkerKey,
      true,
      SERVER_CRON_STEP_DONE_MARKER_TTL_MS,
    );

    this.recordStepSummary({
      jobData,
      enqueuedDispatchCount: resolvedDispatches.length,
      droppedDispatchCount: droppedDispatches.length,
      hasNextStep: isDefined(next),
    });
  }

  private async isServerCronLogicFunctionActive(
    jobData: ServerCronTriggerJobData,
  ): Promise<boolean> {
    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(jobData.workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: jobData.logicFunctionId,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    return (
      isDefined(flatLogicFunction) &&
      !isDefined(flatLogicFunction.deletedAt) &&
      isDefined(flatLogicFunction.serverCronTriggerSettings)
    );
  }

  private async runHandler({
    jobData,
    jobContext,
  }: {
    jobData: ServerCronTriggerJobData;
    jobContext: MessageQueueJobRetryContext<ServerCronTriggerJobData>;
  }): Promise<{ data: unknown } | undefined> {
    const payload: ServerCronPayload = {
      scheduledAt: new Date(jobData.scheduledAtEpochMs).toISOString(),
      step: jobData.step,
      ...(isDefined(jobData.cursor) ? { cursor: jobData.cursor } : {}),
    };

    try {
      const executionResult = await this.logicFunctionJobRunnerService.run({
        logicFunctionPayload: {
          logicFunctionId: jobData.logicFunctionId,
          workspaceId: jobData.workspaceId,
          payload,
          applicationRetryCount: jobData.applicationRetryCount,
        },
        retryLimit: jobContext.retryLimit,
        persistRetryCount: (applicationRetryCount) =>
          jobContext.updateData({ ...jobData, applicationRetryCount }),
      });

      if (!isDefined(executionResult)) {
        this.recordStepFailure({
          jobData,
          reason: 'execution-skipped',
          errorMessage: 'the execution was skipped',
        });

        return undefined;
      }

      if (isDefined(executionResult.error)) {
        this.recordStepFailure({
          jobData,
          reason: 'handler-error',
          errorMessage: executionResult.error.errorMessage,
        });

        return undefined;
      }

      return { data: executionResult.data };
    } catch (error) {
      if (
        error instanceof LogicFunctionExecutionException &&
        error.code ===
          LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND
      ) {
        this.recordStepFailure({
          jobData,
          reason: 'logic-function-not-found',
          errorMessage: error.message,
        });

        return undefined;
      }

      throw error;
    }
  }

  private async enqueueDispatches({
    jobData,
    stepJobId,
    resolvedDispatches,
  }: {
    jobData: ServerCronTriggerJobData;
    stepJobId: string;
    resolvedDispatches: ResolvedServerCronDispatch[];
  }): Promise<void> {
    if (resolvedDispatches.length === 0) {
      return;
    }

    const rateLimitDelaysMs =
      await this.serverCronDispatchRateLimiterService.computeDispatchDelaysMs({
        applicationRegistrationId: jobData.applicationRegistrationId,
        dispatchCount: resolvedDispatches.length,
      });

    await this.messageQueueService.bulkAdd<LogicFunctionTriggerJobData>(
      LogicFunctionTriggerJob.name,
      resolvedDispatches.map((dispatch, dispatchIndex) => {
        const delay = Math.max(
          dispatch.delayMs ?? 0,
          rateLimitDelaysMs[dispatchIndex] ?? 0,
        );

        return {
          data: {
            logicFunctionId: dispatch.logicFunctionId,
            workspaceId: dispatch.workspaceId,
            payload: dispatch.payload ?? {},
          },
          jobId: buildServerCronDispatchJobId({
            stepJobId,
            workspaceId: dispatch.workspaceId,
            targetLogicFunctionUniversalIdentifier:
              dispatch.targetLogicFunctionUniversalIdentifier,
          }),
          ...(delay > 0 ? { delay } : {}),
        };
      }),
      {
        retryLimit: SERVER_CRON_DISPATCH_RETRY_LIMIT,
        backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
        priority: ENQUEUE_JOB_PRIORITY,
        allowDuplicatedPrefixes: true,
      },
    );
  }

  private async enqueueNextStep({
    jobData,
    cursor,
    delayMs,
  }: {
    jobData: ServerCronTriggerJobData;
    cursor: ServerCronPayload['cursor'];
    delayMs?: number;
  }): Promise<void> {
    const nextStep = jobData.step + 1;

    if (nextStep >= SERVER_CRON_MAX_STEPS_PER_TICK) {
      this.recordStepFailure({
        jobData,
        reason: 'max-steps-reached',
        errorMessage: `the chain stopped after ${SERVER_CRON_MAX_STEPS_PER_TICK} steps`,
      });

      return;
    }

    const nextStepJobData: ServerCronTriggerJobData = {
      workspaceId: jobData.workspaceId,
      logicFunctionId: jobData.logicFunctionId,
      logicFunctionUniversalIdentifier:
        jobData.logicFunctionUniversalIdentifier,
      applicationRegistrationId: jobData.applicationRegistrationId,
      scheduledAtEpochMs: jobData.scheduledAtEpochMs,
      step: nextStep,
      cursor,
    };

    await this.messageQueueService.bulkAdd<ServerCronTriggerJobData>(
      ServerCronTriggerJob.name,
      [
        {
          data: nextStepJobData,
          jobId: buildServerCronStepJobId(nextStepJobData),
          ...(isDefined(delayMs) && delayMs > 0 ? { delay: delayMs } : {}),
        },
      ],
      {
        retryLimit: SERVER_CRON_STEP_RETRY_LIMIT,
        backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
        allowDuplicatedPrefixes: true,
      },
    );
  }

  private recordStepFailure({
    jobData,
    reason,
    errorMessage,
  }: {
    jobData: ServerCronTriggerJobData;
    reason: string;
    errorMessage: string;
  }): void {
    this.logger.warn(
      `Server cron logic function ${jobData.logicFunctionId} (registration ${jobData.applicationRegistrationId}, step ${jobData.step}) stopped: ${errorMessage}`,
    );
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.ServerCronStepFailed,
      amount: 1,
      attributes: {
        application_registration_id: jobData.applicationRegistrationId,
        reason,
      },
    });
  }

  private recordStepSummary({
    jobData,
    enqueuedDispatchCount,
    droppedDispatchCount,
    hasNextStep,
  }: {
    jobData: ServerCronTriggerJobData;
    enqueuedDispatchCount: number;
    droppedDispatchCount: number;
    hasNextStep: boolean;
  }): void {
    this.logger.log(
      `Server cron logic function ${jobData.logicFunctionId} (registration ${jobData.applicationRegistrationId}, step ${jobData.step}): ${enqueuedDispatchCount} dispatched, ${droppedDispatchCount} dropped${hasNextStep ? ', next step enqueued' : ''}`,
    );

    const attributes = {
      application_registration_id: jobData.applicationRegistrationId,
    };

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.ServerCronDispatchEnqueued,
      amount: enqueuedDispatchCount,
      attributes,
    });
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.ServerCronDispatchDropped,
      amount: droppedDispatchCount,
      attributes,
    });
  }
}
