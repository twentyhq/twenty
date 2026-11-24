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
import { LOGIC_FUNCTION_JOB_FAILURE_HANDLER_QUEUE_OPTIONS } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-job-failure-handler-queue-options.constant';
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
      : [job.data];

    for (const logicFunctionPayload of logicFunctionPayloads) {
      await this.logicFunctionJobRunnerService.enqueueJobFailureHandlerIfDeclared(
        {
          logicFunctionPayload,
          queueJobId: job.id,
          attemptsMade: job.attemptsMade,
          error: { type: error.name, message: error.message },
          enqueueJobFailureHandler: (jobFailureHandlerJob) =>
            this.messageQueueService.bulkAdd<LogicFunctionTriggerJobData>(
              LogicFunctionTriggerJob.name,
              [jobFailureHandlerJob],
              LOGIC_FUNCTION_JOB_FAILURE_HANDLER_QUEUE_OPTIONS,
            ),
        },
      );
    }
  }
}
