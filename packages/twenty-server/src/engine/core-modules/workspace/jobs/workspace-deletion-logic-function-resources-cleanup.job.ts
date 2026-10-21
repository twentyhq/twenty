import { Inject } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type WorkspaceDeletionLogicFunctionResourcesCleanupJobData } from 'src/engine/core-modules/workspace/types/workspace-deletion-logic-function-resources-cleanup-job-data.type';

import type { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';

@Processor(MessageQueue.lambdaManagementQueue)
export class WorkspaceDeletionLogicFunctionResourcesCleanupJob {
  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  @Process(WorkspaceDeletionLogicFunctionResourcesCleanupJob.name)
  async handle({
    workspaceId,
    logicFunctionIds,
    applicationUniversalIdentifiers,
  }: WorkspaceDeletionLogicFunctionResourcesCleanupJobData): Promise<void> {
    const driver = this.logicFunctionDriverFactory.getCurrentDriver();
    const cleanupFailures: string[] = [];

    for (const logicFunctionId of logicFunctionIds) {
      await driver
        .delete({ id: logicFunctionId })
        .catch((error) =>
          cleanupFailures.push(this.describeFailure(logicFunctionId, error)),
        );
    }

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      await driver
        .deleteApplicationResources({
          workspaceId,
          applicationUniversalIdentifier,
        })
        .catch((error) =>
          cleanupFailures.push(
            this.describeFailure(applicationUniversalIdentifier, error),
          ),
        );
    }

    if (isNonEmptyArray(cleanupFailures)) {
      throw new Error(
        `[${WorkspaceDeletionLogicFunctionResourcesCleanupJob.name}] Cannot cleanup logic function resources - ${workspaceId} - ${cleanupFailures.join('; ')}`,
      );
    }
  }

  private describeFailure(resourceIdentifier: string, error: unknown): string {
    return `${resourceIdentifier}: ${error instanceof Error ? error.message : String(error)}`;
  }
}
