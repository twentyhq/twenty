import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import {
  KeepWarmWorkspaceLogicFunctionsJob,
  type KeepWarmWorkspaceLogicFunctionsJobData,
} from 'src/engine/core-modules/logic-function/logic-function-warm-up/jobs/keep-warm-workspace-logic-functions.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// Well below Lambda's undocumented idle-container reclaim delay (observed 5-15 min, sometimes less).
export const KEEP_WARM_LOGIC_FUNCTIONS_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class KeepWarmLogicFunctionsCronJob {
  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly logicFunctionQueueService: MessageQueueService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Process(KeepWarmLogicFunctionsCronJob.name)
  @SentryCronMonitor(
    KeepWarmLogicFunctionsCronJob.name,
    KEEP_WARM_LOGIC_FUNCTIONS_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    if (
      this.twentyConfigService.get('LOGIC_FUNCTION_TYPE') !==
      LogicFunctionDriverType.LAMBDA
    ) {
      return;
    }

    const workspacesWithWarmLogicFunctions = await this.workspaceRepository
      .createQueryBuilder('workspace')
      .select('workspace.id', 'id')
      .where('workspace.activationStatus = :activationStatus', {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      })
      .andWhere(
        `EXISTS (SELECT 1 FROM "core"."logicFunction" "logicFunction" WHERE "logicFunction"."workspaceId" = "workspace"."id" AND "logicFunction"."keepWarm" = true AND "logicFunction"."deletedAt" IS NULL)`,
      )
      .getRawMany<{ id: string }>();

    // One pending ping per workspace: a tick that finds the previous one still queued is dropped.
    await Promise.all(
      workspacesWithWarmLogicFunctions.map(({ id: workspaceId }) =>
        this.logicFunctionQueueService.add<KeepWarmWorkspaceLogicFunctionsJobData>(
          KeepWarmWorkspaceLogicFunctionsJob.name,
          { workspaceId },
          {
            isWorkspaceJob: true,
            workspaceId,
            deduplication: { id: `keep-warm-logic-functions:${workspaceId}` },
          },
        ),
      ),
    );
  }
}
