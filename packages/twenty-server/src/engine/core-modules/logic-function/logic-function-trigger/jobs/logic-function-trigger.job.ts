import { Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

export type LogicFunctionTriggerJobData = {
  logicFunctionId: string;
  workspaceId: string;
  payload?: object;
  userId?: string;
  userWorkspaceId?: string;
  // A failed job is retried as a whole, so only set this on single-payload
  // jobs whose target function is idempotent (e.g. queued server-route
  // webhook dispatch, where queue retries replace the sender's redeliveries).
  shouldRetryOnUserError?: boolean;
};

@Processor({
  queueName: MessageQueue.logicFunctionQueue,
  scope: Scope.REQUEST,
})
export class LogicFunctionTriggerJob {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  @Process(LogicFunctionTriggerJob.name)
  async handle(logicFunctionPayloads: LogicFunctionTriggerJobData[]) {
    await Promise.all(
      logicFunctionPayloads.map(async (logicFunctionPayload) => {
        const result = await this.logicFunctionExecutorService.execute({
          logicFunctionId: logicFunctionPayload.logicFunctionId,
          workspaceId: logicFunctionPayload.workspaceId,
          payload: logicFunctionPayload.payload ?? {},
          userId: logicFunctionPayload.userId,
          userWorkspaceId: logicFunctionPayload.userWorkspaceId,
        });

        if (
          logicFunctionPayload.shouldRetryOnUserError === true &&
          isDefined(result.error)
        ) {
          throw new Error(
            `Logic function ${logicFunctionPayload.logicFunctionId} failed: ${result.error.errorMessage}`,
          );
        }
      }),
    );
  }
}
