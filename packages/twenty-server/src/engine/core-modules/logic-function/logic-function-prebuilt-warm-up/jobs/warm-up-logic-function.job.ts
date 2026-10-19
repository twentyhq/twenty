import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

import { LogicFunctionPrebuiltWarmUpService } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/logic-function-prebuilt-warm-up.service';
import {
  WARM_UP_LOGIC_FUNCTION_JOB_NAME,
  type WarmUpLogicFunctionJobData,
} from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/jobs/warm-up-logic-function.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

@Processor(MessageQueue.lambdaManagementQueue)
export class WarmUpLogicFunctionJob {
  constructor(
    private readonly logicFunctionPrebuiltWarmUpService: LogicFunctionPrebuiltWarmUpService,
  ) {}

  @Process(WARM_UP_LOGIC_FUNCTION_JOB_NAME)
  async handle(data: WarmUpLogicFunctionJobData): Promise<void> {
    try {
      await this.logicFunctionPrebuiltWarmUpService.warmUpLogicFunction(data);
    } catch (error) {
      if (
        error instanceof LogicFunctionException &&
        error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_RATE_LIMITED
      ) {
        throw new RetryableLogicFunctionError(error.message);
      }

      throw error;
    }
  }
}
