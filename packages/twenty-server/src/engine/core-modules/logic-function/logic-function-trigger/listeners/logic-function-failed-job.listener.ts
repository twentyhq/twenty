import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ApplicationLifecycleHookJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/application-lifecycle-hook.job';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import {
  LogicFunctionJobRunnerService,
  type LogicFunctionJobPayload,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { buildLogicFunctionFailureHandlerJobOptions } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-logic-function-failure-handler-job-options.util';
import { QUEUE_JOB_FAILED_EVENT } from 'src/engine/core-modules/message-queue/constants/queue-job-failed-event.constant';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type QueueJobFailedEvent } from 'src/engine/core-modules/message-queue/types/queue-job-failed-event.type';

const LOGIC_FUNCTION_JOB_NAMES = [
  LogicFunctionTriggerJob.name,
  ApplicationLifecycleHookJob.name,
];

@Injectable()
export class LogicFunctionFailedJobListener {
  constructor(
    private readonly logicFunctionJobRunnerService: LogicFunctionJobRunnerService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent(QUEUE_JOB_FAILED_EVENT)
  async handleJobFailed({ job, error }: QueueJobFailedEvent): Promise<void> {
    if (!LOGIC_FUNCTION_JOB_NAMES.includes(job.name)) {
      return;
    }

    const logicFunctionPayloads: LogicFunctionJobPayload[] = Array.isArray(
      job.data,
    )
      ? job.data
      : [job.data as LogicFunctionJobPayload];

    for (const logicFunctionPayload of logicFunctionPayloads) {
      await this.logicFunctionJobRunnerService.enqueueFailureHandlerIfDeclared({
        logicFunctionPayload,
        jobId: job.id,
        attemptsMade: job.attemptsMade,
        failure: { errorType: error.name, errorMessage: error.message },
        enqueueFailureHandler: (failureHandlerJob) =>
          this.messageQueueService.add<LogicFunctionTriggerJobData>(
            LogicFunctionTriggerJob.name,
            failureHandlerJob.jobData,
            buildLogicFunctionFailureHandlerJobOptions(failureHandlerJob),
          ),
      });
    }
  }
}
