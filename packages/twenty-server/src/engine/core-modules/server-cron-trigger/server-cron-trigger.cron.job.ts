import { Logger } from '@nestjs/common';
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
import {
  ServerCronTriggerDispatchJob,
  type ServerCronTriggerDispatchJobData,
} from 'src/engine/core-modules/server-cron-trigger/jobs/server-cron-trigger-dispatch.job';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { shouldRunNow } from 'src/utils/should-run-now.utils';

export const SERVER_CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class ServerCronTriggerCronJob {
  private readonly logger = new Logger(ServerCronTriggerCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly cronQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Process(ServerCronTriggerCronJob.name)
  @SentryCronMonitor(
    ServerCronTriggerCronJob.name,
    SERVER_CRON_TRIGGER_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    if (!this.twentyConfigService.get('IS_SERVER_LOGIC_FUNCTION_ENABLED')) {
      return;
    }

    const now = new Date();

    const activeWorkspaces = await this.workspaceRepository.find({
      where: { activationStatus: WorkspaceActivationStatus.ACTIVE },
      select: ['id'],
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
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

          if (isDefined(logicFunction.deletedAt)) {
            continue;
          }

          const settings = logicFunction.serverCronTriggerSettings;

          if (!isDefined(settings?.pattern)) {
            continue;
          }

          if (!isDefined(settings.targetLogicFunctionUniversalIdentifier)) {
            continue;
          }

          if (!shouldRunNow(settings.pattern, now)) {
            continue;
          }

          await this.cronQueueService.add<ServerCronTriggerDispatchJobData>(
            ServerCronTriggerDispatchJob.name,
            {
              resolverLogicFunctionId: logicFunction.id,
              ownerWorkspaceId: activeWorkspace.id,
              targetLogicFunctionUniversalIdentifier:
                settings.targetLogicFunctionUniversalIdentifier,
            },
            { retryLimit: 3 },
          );
        }
      } catch (error) {
        this.logger.error(
          `Error processing workspace ${activeWorkspace.id}: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
