import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  type LogicFunctionExecutionContext,
  LogicFunctionExecutionSource,
} from 'src/engine/core-modules/logic-function/logic-function-executor/types/logic-function-execution-context.type';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export type LogicFunctionTriggerJobData = {
  logicFunctionId: string;
  workspaceId: string;
  payload?: object;
  userId?: string;
  userWorkspaceId?: string;
  source?: LogicFunctionExecutionSource;
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
  async handle(
    jobData: LogicFunctionTriggerJobData | LogicFunctionTriggerJobData[],
  ) {
    // Jobs enqueued in version <=2.24.x carry arrays, remove this case once those jobs are drained
    const logicFunctionPayloads = Array.isArray(jobData) ? jobData : [jobData];

    for (const logicFunctionPayload of logicFunctionPayloads) {
      try {
        const executionContext: LogicFunctionExecutionContext = {
          source: logicFunctionPayload.source ?? LogicFunctionExecutionSource.MANUAL,
        };

        await this.logicFunctionExecutorService.execute({
          logicFunctionId: logicFunctionPayload.logicFunctionId,
          workspaceId: logicFunctionPayload.workspaceId,
          payload: logicFunctionPayload.payload ?? {},
          userId: logicFunctionPayload.userId,
          userWorkspaceId: logicFunctionPayload.userWorkspaceId,
          executionContext,
        });
      } catch (error) {
        // A stopped application must not fail the job: failing would make
        // the queue retry an execution that is intentionally blocked.
        if (
          error instanceof LogicFunctionException &&
          error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED
        ) {
          continue;
        }

        throw error;
      }
    }
  }
}
