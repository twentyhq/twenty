import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

export type LogicFunctionTriggerJobData = {
  logicFunctionId: string;
  workspaceId: string;
  payload?: object;
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
      logicFunctionPayloads.map(
        async (logicFunctionPayload) =>
          await this.logicFunctionExecutorService.execute({
            logicFunctionId: logicFunctionPayload.logicFunctionId,
            workspaceId: logicFunctionPayload.workspaceId,
            payload: logicFunctionPayload.payload ?? {},
          }),
      ),
    );
  }
}
