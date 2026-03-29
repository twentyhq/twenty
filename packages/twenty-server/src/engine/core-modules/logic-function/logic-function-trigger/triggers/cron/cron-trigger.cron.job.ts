import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  LogicFunctionTriggerJob,
  LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { shouldRunNow } from 'src/utils/should-run-now.utils';

export const CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class CronTriggerCronJob {
  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Process(CronTriggerCronJob.name)
  @SentryCronMonitor(CronTriggerCronJob.name, CRON_TRIGGER_CRON_PATTERN)
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id'],
    });

    const now = new Date();

    for (const activeWorkspace of activeWorkspaces) {
      const { flatLogicFunctionMaps } =
        await this.workspaceCacheService.getOrRecompute(activeWorkspace.id, [
          'flatLogicFunctionMaps',
        ]);

      const logicFunctions = Object.values(
        flatLogicFunctionMaps.byUniversalIdentifier,
      );

      for (const logicFunction of logicFunctions) {
        if (!isDefined(logicFunction)) {
          continue;
        }

        const cronSettings = logicFunction.cronTriggerSettings;

        if (!isDefined(cronSettings?.pattern)) {
          continue;
        }

        if (isDefined(logicFunction.deletedAt)) {
          continue;
        }

        if (!shouldRunNow(cronSettings.pattern, now)) {
          continue;
        }

        await this.messageQueueService.add<LogicFunctionTriggerJobData[]>(
          LogicFunctionTriggerJob.name,
          [
            {
              logicFunctionId: logicFunction.id,
              workspaceId: activeWorkspace.id,
              payload: {},
            },
          ],
          { retryLimit: 3 },
        );
      }
    }
  }
}
