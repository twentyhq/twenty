import { LogicFunctionPrebuiltWarmUpService } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/logic-function-prebuilt-warm-up.service';
import {
  WARM_UP_LOGIC_FUNCTION_JOB_NAME,
  WARM_UP_LOGIC_FUNCTION_RATE_LIMITED_RETRY,
  type WarmUpLogicFunctionJobData,
} from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/jobs/warm-up-logic-function.job-constants';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

@Processor(MessageQueue.lambdaManagementQueue)
export class WarmUpLogicFunctionJob {
  constructor(
    private readonly logicFunctionPrebuiltWarmUpService: LogicFunctionPrebuiltWarmUpService,
    @InjectMessageQueue(MessageQueue.lambdaManagementQueue)
    private readonly lambdaManagementQueueService: MessageQueueService,
  ) {}

  @Process(WARM_UP_LOGIC_FUNCTION_JOB_NAME)
  async handle(data: WarmUpLogicFunctionJobData): Promise<void> {
    try {
      await this.logicFunctionPrebuiltWarmUpService.warmUpLogicFunction(data);
    } catch (error) {
      const rateLimitedRetryCount = data.rateLimitedRetryCount ?? 0;

      if (
        !(error instanceof LogicFunctionException) ||
        error.code !== LogicFunctionExceptionCode.LOGIC_FUNCTION_RATE_LIMITED ||
        rateLimitedRetryCount >=
          WARM_UP_LOGIC_FUNCTION_RATE_LIMITED_RETRY.maxRetryCount
      ) {
        throw error;
      }

      await this.lambdaManagementQueueService.add<WarmUpLogicFunctionJobData>(
        WARM_UP_LOGIC_FUNCTION_JOB_NAME,
        { ...data, rateLimitedRetryCount: rateLimitedRetryCount + 1 },
        {
          delay:
            WARM_UP_LOGIC_FUNCTION_RATE_LIMITED_RETRY.baseDelayMs *
            2 ** rateLimitedRetryCount,
        },
      );
    }
  }
}
