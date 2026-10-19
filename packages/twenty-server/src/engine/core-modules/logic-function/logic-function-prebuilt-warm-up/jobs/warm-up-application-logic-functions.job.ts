import {
  WARM_UP_LOGIC_FUNCTION_JOB_NAME,
  WARM_UP_LOGIC_FUNCTION_JOB_OPTIONS,
  type WarmUpLogicFunctionJobData,
} from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/jobs/warm-up-logic-function.job-constants';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

type WarmUpApplicationLogicFunctionsJobData = {
  workspaceId: string;
  applicationId: string;
  logicFunctionUniversalIdentifiers: string[];
};

// Jobs enqueued before the lambda-management-queue existed, remove once drained
@Processor(MessageQueue.workspaceQueue)
export class WarmUpApplicationLogicFunctionsJob {
  constructor(
    @InjectMessageQueue(MessageQueue.lambdaManagementQueue)
    private readonly lambdaManagementQueueService: MessageQueueService,
  ) {}

  @Process(WarmUpApplicationLogicFunctionsJob.name)
  async handle({
    workspaceId,
    applicationId,
    logicFunctionUniversalIdentifiers,
  }: WarmUpApplicationLogicFunctionsJobData): Promise<void> {
    await this.lambdaManagementQueueService.bulkAdd<WarmUpLogicFunctionJobData>(
      WARM_UP_LOGIC_FUNCTION_JOB_NAME,
      logicFunctionUniversalIdentifiers.map(
        (logicFunctionUniversalIdentifier) => ({
          data: {
            workspaceId,
            applicationId,
            logicFunctionUniversalIdentifier,
          },
        }),
      ),
      WARM_UP_LOGIC_FUNCTION_JOB_OPTIONS,
    );
  }
}
