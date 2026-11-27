import { Injectable, Logger } from '@nestjs/common';

import { type EventOccurrence } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { ApplicationRepeatedEventRecorderService } from 'src/engine/core-modules/event-logs/emit/application-repeated-event-recorder.service';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { findLogicFunctionsTriggeredByAppEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/app-event/utils/find-logic-functions-triggered-by-app-event.util';
import { buildApplicationJobMemoryLimitLogEntry } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-application-job-memory-limit-log-entry.util';
import { buildApplicationJobThrottledLogEntry } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-application-job-throttled-log-entry.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { type QueueJobToAdd } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueException } from 'src/engine/core-modules/message-queue/message-queue.exception';
import { ApplicationJobEnqueueThrottlerService } from 'src/engine/core-modules/message-queue/services/application-job-enqueue-throttler.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AppEventTriggerService {
  private readonly logger = new Logger(AppEventTriggerService.name);

  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationJobEnqueueThrottlerService: ApplicationJobEnqueueThrottlerService,
    private readonly applicationRepeatedEventRecorderService: ApplicationRepeatedEventRecorderService,
  ) {}

  async triggerLogicFunctions({
    workspaceId,
    applicationId,
    eventUniversalIdentifier,
    occurrence,
  }: {
    workspaceId: string;
    applicationId: string;
    eventUniversalIdentifier: string;
    occurrence: EventOccurrence;
  }): Promise<void> {
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
      ]);

    const logicFunctions = findLogicFunctionsTriggeredByAppEvent({
      flatLogicFunctionMaps,
      applicationId,
      eventUniversalIdentifier,
    });

    if (logicFunctions.length === 0) {
      return;
    }

    const application = findActiveFlatApplicationById(
      flatApplicationMaps,
      applicationId,
    );
    const applicationRegistrationId = application?.applicationRegistrationId;

    if (!isDefined(application) || !isDefined(applicationRegistrationId)) {
      return;
    }

    try {
      await this.applicationJobEnqueueThrottlerService.throttleOrThrow({
        applicationId,
        applicationRegistrationId,
        jobCount: logicFunctions.length,
      });
    } catch (error) {
      if (!(error instanceof ThrottlerException)) {
        throw error;
      }

      this.logger.warn(
        `Enqueue throttled for application ${applicationId} in workspace ${workspaceId}: refusing ${logicFunctions.length} app event trigger(s)`,
      );
      this.applicationRepeatedEventRecorderService.record({
        entry: buildApplicationJobThrottledLogEntry({
          workspaceId,
          application,
        }),
        occurrenceCount: logicFunctions.length,
      });

      throw error;
    }

    // The queue takes one retry limit per call, so jobs are added per limit
    const jobsByRetryLimit = new Map<
      number,
      QueueJobToAdd<LogicFunctionTriggerJobData>[]
    >();

    for (const logicFunction of logicFunctions) {
      const retryLimit = logicFunction.retryLimit ?? 3;

      jobsByRetryLimit.set(retryLimit, [
        ...(jobsByRetryLimit.get(retryLimit) ?? []),
        {
          data: {
            logicFunctionId: logicFunction.id,
            workspaceId,
            applicationUniversalIdentifier: application.universalIdentifier,
            payload: occurrence,
          },
          jobId: `appEvent.${occurrence.id}.${logicFunction.id}`,
          workspaceId,
          applicationUniversalIdentifier: application.universalIdentifier,
        },
      ]);
    }

    try {
      for (const [retryLimit, jobs] of jobsByRetryLimit) {
        await this.messageQueueService.bulkAdd<LogicFunctionTriggerJobData>(
          LogicFunctionTriggerJob.name,
          jobs,
          {
            retryLimit,
            backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
            doNotCheckDuplicatesBasedOnPrefix: true,
          },
        );
      }
    } catch (error) {
      if (!(error instanceof MessageQueueException)) {
        throw error;
      }

      this.logger.warn(
        `Enqueue refused for application ${applicationId} in workspace ${workspaceId}: refusing ${logicFunctions.length} app event trigger(s): ${error.message}`,
      );
      this.applicationRepeatedEventRecorderService.record({
        entry: buildApplicationJobMemoryLimitLogEntry({
          workspaceId,
          application,
          exception: error,
        }),
        occurrenceCount: logicFunctions.length,
      });

      throw error;
    }
  }
}
