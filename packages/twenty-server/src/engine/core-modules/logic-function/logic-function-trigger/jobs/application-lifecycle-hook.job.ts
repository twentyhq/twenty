import { Scope } from '@nestjs/common';

import {
  LogicFunctionJobRunnerService,
  type LogicFunctionJobPayload,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { buildLogicFunctionFailureHandlerJobOptions } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-logic-function-failure-handler-job-options.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobRetryContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

export type ApplicationLifecycleHookJobData = LogicFunctionJobPayload;

@Processor({
  queueName: MessageQueue.applicationLifecycleHookQueue,
  scope: Scope.REQUEST,
})
export class ApplicationLifecycleHookJob {
  constructor(
    private readonly logicFunctionJobRunnerService: LogicFunctionJobRunnerService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(ApplicationLifecycleHookJob.name)
  async handle(
    jobData: ApplicationLifecycleHookJobData,
    jobContext: MessageQueueJobRetryContext<ApplicationLifecycleHookJobData>,
  ) {
    await this.logicFunctionJobRunnerService.run({
      logicFunctionPayload: jobData,
      retryLimit: jobContext.retryLimit,
      attemptsMade: jobContext.attemptsMade,
      persistRetryCount: (applicationRetryCount) =>
        jobContext.updateData({ ...jobData, applicationRetryCount }),
      enqueueFailureHandler: (failureHandlerJob) =>
        this.messageQueueService.add<LogicFunctionTriggerJobData>(
          LogicFunctionTriggerJob.name,
          failureHandlerJob.jobData,
          buildLogicFunctionFailureHandlerJobOptions(failureHandlerJob),
        ),
    });
  }
}
