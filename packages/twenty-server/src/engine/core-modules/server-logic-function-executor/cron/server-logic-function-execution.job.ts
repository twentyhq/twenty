import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ServerLogicFunctionExecutorService } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.service';

export type ServerLogicFunctionExecutionJobData = {
  applicationRegistrationUniversalIdentifier: string;
  logicFunctionUniversalIdentifier: string;
};

@Processor({
  queueName: MessageQueue.logicFunctionQueue,
  scope: Scope.REQUEST,
})
export class ServerLogicFunctionExecutionJob {
  constructor(
    private readonly serverLogicFunctionExecutorService: ServerLogicFunctionExecutorService,
  ) {}

  @Process(ServerLogicFunctionExecutionJob.name)
  async handle(data: ServerLogicFunctionExecutionJobData): Promise<void> {
    const outcome = await this.serverLogicFunctionExecutorService.run({
      applicationRegistrationUniversalIdentifier:
        data.applicationRegistrationUniversalIdentifier,
      logicFunctionUniversalIdentifier: data.logicFunctionUniversalIdentifier,
      payload: { source: 'cron' },
    });

    // Surface user-thrown failures so BullMQ retries / DLQs the job instead of
    // silently acknowledging a failed run.
    if (outcome.kind === 'userError') {
      throw new Error(outcome.errorMessage);
    }
  }
}
