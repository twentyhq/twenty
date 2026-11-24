import { Scope } from '@nestjs/common';

import {
  LogicFunctionJobRunnerService,
  type LogicFunctionJobPayload,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { LOGIC_FUNCTION_JOB_FAILURE_HANDLER_QUEUE_OPTIONS } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-job-failure-handler-queue-options.constant';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobRetryContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

export type LogicFunctionTriggerJobData = LogicFunctionJobPayload;

@Processor({
  queueName: MessageQueue.logicFunctionQueue,
  scope: Scope.REQUEST,
})
export class LogicFunctionTriggerJob {
  constructor(
    private readonly logicFunctionJobRunnerService: LogicFunctionJobRunnerService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(LogicFunctionTriggerJob.name)
  async handle(
    jobData: LogicFunctionTriggerJobData | LogicFunctionTriggerJobData[],
    jobContext: MessageQueueJobRetryContext<
      LogicFunctionTriggerJobData | LogicFunctionTriggerJobData[]
    >,
  ) {
    // Jobs enqueued in version <=2.24.x carry arrays, remove this case once those jobs are drained
    const logicFunctionPayloads = Array.isArray(jobData) ? jobData : [jobData];

    for (const [
      payloadIndex,
      logicFunctionPayload,
    ] of logicFunctionPayloads.entries()) {
      await this.logicFunctionJobRunnerService.run({
        logicFunctionPayload,
        jobId: jobContext.jobId,
        retryLimit: jobContext.retryLimit,
        attemptsMade: jobContext.attemptsMade,
        persistRetryCount: (applicationRetryCount) =>
          jobContext.updateData(
            Array.isArray(jobData)
              ? logicFunctionPayloads.map((payload, index) =>
                  index === payloadIndex
                    ? { ...payload, applicationRetryCount }
                    : payload,
                )
              : { ...logicFunctionPayload, applicationRetryCount },
          ),
        enqueueJobFailureHandler: (jobFailureHandlerJob) =>
          this.messageQueueService.bulkAdd<LogicFunctionTriggerJobData>(
            LogicFunctionTriggerJob.name,
            [jobFailureHandlerJob],
            LOGIC_FUNCTION_JOB_FAILURE_HANDLER_QUEUE_OPTIONS,
          ),
      });
    }
  }
}
