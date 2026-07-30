import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { withApplicationJobEnqueueContext } from 'src/engine/core-modules/message-queue/storage/application-job-enqueue-context.storage';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  LogicFunctionTriggerJob,
  LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class CronTriggerCronJob {
  private readonly logger = new Logger(CronTriggerCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly cronTriggerDeduplicationService: CronTriggerDeduplicationService,
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
      try {
        const { flatLogicFunctionMaps, flatApplicationMaps } =
          await this.workspaceCacheService.getOrRecompute(activeWorkspace.id, [
            'flatLogicFunctionMaps',
            'flatApplicationMaps',
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

          const shouldDispatch =
            await this.cronTriggerDeduplicationService.shouldDispatch(
              `logic-function-cron:${activeWorkspace.id}:${logicFunction.id}`,
              cronSettings.pattern,
              now,
            );

          if (!shouldDispatch) {
            continue;
          }

          const application = findActiveFlatApplicationById(
            flatApplicationMaps,
            logicFunction.applicationId,
          );
          const applicationRegistrationId =
            application?.applicationRegistrationId;

          if (!isDefined(applicationRegistrationId)) {
            continue;
          }

          await withApplicationJobEnqueueContext(
            {
              applicationId: logicFunction.applicationId,
              applicationRegistrationId,
            },
            () =>
              this.messageQueueService.add<LogicFunctionTriggerJobData>(
                LogicFunctionTriggerJob.name,
                {
                  logicFunctionId: logicFunction.id,
                  workspaceId: activeWorkspace.id,
                  payload: {},
                },
                { retryLimit: 10 },
              ),
          );
        }
      } catch (error) {
        this.logger.error(
          `Error processing workspace ${activeWorkspace.id}: ${error}`,
        );
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: activeWorkspace.id },
        });
      }
    }
  }
}
