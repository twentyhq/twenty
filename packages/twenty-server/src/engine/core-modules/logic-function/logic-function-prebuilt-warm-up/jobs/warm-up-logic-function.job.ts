import { LogicFunctionPrebuiltWarmUpService } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/logic-function-prebuilt-warm-up.service';
import {
  WARM_UP_LOGIC_FUNCTION_JOB_NAME,
  type WarmUpLogicFunctionJobData,
} from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/jobs/warm-up-logic-function.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.lambdaManagementQueue)
export class WarmUpLogicFunctionJob {
  constructor(
    private readonly logicFunctionPrebuiltWarmUpService: LogicFunctionPrebuiltWarmUpService,
  ) {}

  @Process(WARM_UP_LOGIC_FUNCTION_JOB_NAME)
  async handle(data: WarmUpLogicFunctionJobData): Promise<void> {
    await this.logicFunctionPrebuiltWarmUpService.warmUpLogicFunction(data);
  }
}
