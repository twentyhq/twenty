import { LogicFunctionPrebuiltWarmUpService } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/logic-function-prebuilt-warm-up.service';
import {
  WARM_UP_APPLICATION_LOGIC_FUNCTIONS_JOB_NAME,
  type WarmUpApplicationLogicFunctionsJobData,
} from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/jobs/warm-up-application-logic-functions.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.workspaceQueue)
export class WarmUpApplicationLogicFunctionsJob {
  constructor(
    private readonly logicFunctionPrebuiltWarmUpService: LogicFunctionPrebuiltWarmUpService,
  ) {}

  @Process(WARM_UP_APPLICATION_LOGIC_FUNCTIONS_JOB_NAME)
  async handle(data: WarmUpApplicationLogicFunctionsJobData): Promise<void> {
    await this.logicFunctionPrebuiltWarmUpService.warmUpApplicationLogicFunctions(
      data,
    );
  }
}
