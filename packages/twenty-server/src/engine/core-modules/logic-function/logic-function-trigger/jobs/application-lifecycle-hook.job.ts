import { Scope } from '@nestjs/common';

import {
  LogicFunctionJobRunnerService,
  type LogicFunctionJobPayload,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobRetryContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type ApplicationLifecycleHookJobData = LogicFunctionJobPayload;

@Processor({
  queueName: MessageQueue.applicationLifecycleHookQueue,
  scope: Scope.REQUEST,
})
export class ApplicationLifecycleHookJob {
  constructor(
    private readonly logicFunctionJobRunnerService: LogicFunctionJobRunnerService,
  ) {}

  @Process(ApplicationLifecycleHookJob.name)
  async handle(
    jobData: ApplicationLifecycleHookJobData,
    jobContext: MessageQueueJobRetryContext<ApplicationLifecycleHookJobData>,
  ) {
    await this.logicFunctionJobRunnerService.run({
      logicFunctionPayload: jobData,
      retryLimit: jobContext.retryLimit,
      persistRetryCount: (applicationRetryCount) =>
        jobContext.updateData({ ...jobData, applicationRetryCount }),
    });
  }
}
