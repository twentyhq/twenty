import { Inject } from '@nestjs/common';

import {
  DELETE_APPLICATION_RUNTIME_RESOURCES_JOB_NAME,
  type DeleteApplicationRuntimeResourcesJobData,
} from 'src/engine/core-modules/application/jobs/delete-application-runtime-resources.job-constants';
import { deleteApplicationRuntimeResources } from 'src/engine/core-modules/application/utils/delete-application-runtime-resources.util';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.deleteCascadeQueue)
export class DeleteApplicationRuntimeResourcesJob {
  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  @Process(DELETE_APPLICATION_RUNTIME_RESOURCES_JOB_NAME)
  async handle({
    workspaceId,
    applicationUniversalIdentifiers,
  }: DeleteApplicationRuntimeResourcesJobData): Promise<void> {
    await deleteApplicationRuntimeResources({
      logicFunctionDriver: this.logicFunctionDriverFactory.getCurrentDriver(),
      workspaceId,
      applicationUniversalIdentifiers,
    });
  }
}
