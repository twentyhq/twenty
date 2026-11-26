import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionPrebuiltInstallService } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-install/logic-function-prebuilt-install.service';
import {
  WARM_UP_LOGIC_FUNCTION_JOB_NAME,
  type WarmUpLogicFunctionJobData,
} from 'src/engine/core-modules/logic-function/logic-function-warm-up/jobs/warm-up-logic-function.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.lambdaManagementQueue)
export class WarmUpLogicFunctionJob {
  constructor(
    private readonly logicFunctionPrebuiltInstallService: LogicFunctionPrebuiltInstallService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  @Process(WARM_UP_LOGIC_FUNCTION_JOB_NAME)
  async handle(data: WarmUpLogicFunctionJobData): Promise<void> {
    const installedFlatLogicFunction =
      await this.logicFunctionPrebuiltInstallService.installPrebuiltBundleIfReady(
        data,
      );

    if (!isDefined(installedFlatLogicFunction)) {
      return;
    }

    await this.logicFunctionExecutorService.warmUp({
      workspaceId: data.workspaceId,
      logicFunctionId: installedFlatLogicFunction.id,
    });
  }
}
