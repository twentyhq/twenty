import { Inject } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  DELETE_APPLICATION_RUNTIME_RESOURCES_JOB_NAME,
  type DeleteApplicationRuntimeResourcesJobData,
} from 'src/engine/core-modules/application/jobs/delete-application-runtime-resources.job-constants';
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
    logicFunctionIds,
  }: DeleteApplicationRuntimeResourcesJobData): Promise<void> {
    const driver = this.logicFunctionDriverFactory.getCurrentDriver();
    const failures: string[] = [];

    for (const logicFunctionId of logicFunctionIds) {
      try {
        await driver.delete({ id: logicFunctionId });
      } catch (error) {
        failures.push(
          `logic function ${logicFunctionId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      try {
        await driver.deleteApplicationResources({
          workspaceId,
          applicationUniversalIdentifier,
        });
      } catch (error) {
        failures.push(
          `application ${applicationUniversalIdentifier}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (isNonEmptyArray(failures)) {
      throw new Error(
        `Failed to delete runtime resources for workspace ${workspaceId}: ${failures.join('; ')}`,
      );
    }
  }
}
