import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  WARM_UP_LOGIC_FUNCTION_JOB_NAME,
  type WarmUpLogicFunctionJobData,
} from 'src/engine/core-modules/logic-function/logic-function-warm-up/jobs/warm-up-logic-function.job-constants';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Well below Lambda's undocumented idle-container reclaim delay (observed 5-15 min, sometimes less).
export const KEEP_WARM_LOGIC_FUNCTIONS_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class KeepWarmLogicFunctionsCronJob {
  private readonly logger = new Logger(KeepWarmLogicFunctionsCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.lambdaManagementQueue)
    private readonly lambdaManagementQueueService: MessageQueueService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(KeepWarmLogicFunctionsCronJob.name)
  @SentryCronMonitor(
    KeepWarmLogicFunctionsCronJob.name,
    KEEP_WARM_LOGIC_FUNCTIONS_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: { activationStatus: WorkspaceActivationStatus.ACTIVE },
      select: ['id'],
    });

    for (const { id: workspaceId } of activeWorkspaces) {
      try {
        await this.enqueueWorkspaceWarmUps(workspaceId);
      } catch (error) {
        this.logger.error(
          `Failed to enqueue keep-warm pings for workspace ${workspaceId}`,
        );
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: workspaceId },
        });
      }
    }
  }

  private async enqueueWorkspaceWarmUps(workspaceId: string): Promise<void> {
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
      ]);

    const jobs = Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatLogicFunction) =>
          flatLogicFunction.isWarm && !isDefined(flatLogicFunction.deletedAt),
      )
      .flatMap((flatLogicFunction) => {
        const flatApplication = findActiveFlatApplicationById(
          flatApplicationMaps,
          flatLogicFunction.applicationId,
        );

        if (!isDefined(flatApplication)) {
          return [];
        }

        return [
          {
            data: {
              workspaceId,
              applicationId: flatApplication.id,
              logicFunctionUniversalIdentifier:
                flatLogicFunction.universalIdentifier,
            },
            workspaceId,
            applicationUniversalIdentifier: flatApplication.universalIdentifier,
          },
        ];
      });

    if (jobs.length === 0) {
      return;
    }

    // No retries: the next tick is the retry.
    await this.lambdaManagementQueueService.bulkAdd<WarmUpLogicFunctionJobData>(
      WARM_UP_LOGIC_FUNCTION_JOB_NAME,
      jobs,
      { retryLimit: 0 },
    );
  }
}
