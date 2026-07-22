import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
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
};

@Processor({
  queueName: MessageQueue.logicFunctionQueue,
  scope: Scope.REQUEST,
})
export class LogicFunctionTriggerJob {
  private readonly logger = new Logger(LogicFunctionTriggerJob.name);

  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  @Process(LogicFunctionTriggerJob.name)
  async handle(logicFunctionPayloads: LogicFunctionTriggerJobData[]) {
    await Promise.all(
      logicFunctionPayloads.map(async (logicFunctionPayload) => {
        try {
          await this.logicFunctionExecutorService.execute({
            logicFunctionId: logicFunctionPayload.logicFunctionId,
            workspaceId: logicFunctionPayload.workspaceId,
            payload: logicFunctionPayload.payload ?? {},
            userId: logicFunctionPayload.userId,
            userWorkspaceId: logicFunctionPayload.userWorkspaceId,
          });
        } catch (error) {
          // A stopped application must not fail the job: failing would make
          // the queue retry an execution that is intentionally blocked.
          if (
            error instanceof LogicFunctionException &&
            error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED
          ) {
            this.logger.warn(
              `Skipping execution of logic function ${logicFunctionPayload.logicFunctionId} in workspace ${logicFunctionPayload.workspaceId}: ${error.message}`,
            );

            return;
          }

          throw error;
        }
      }),
    );
  }
}
