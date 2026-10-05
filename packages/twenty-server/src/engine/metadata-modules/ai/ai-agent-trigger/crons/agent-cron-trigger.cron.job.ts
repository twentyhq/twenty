import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RunAgentTriggerJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/run-agent-trigger.job';
import { AgentTriggerThrottlerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-throttler.service';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';
import { findActiveAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/find-active-agent-triggers.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const AGENT_CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class AgentCronTriggerCronJob {
  private readonly logger = new Logger(AgentCronTriggerCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly cronTriggerDeduplicationService: CronTriggerDeduplicationService,
    private readonly agentTriggerThrottlerService: AgentTriggerThrottlerService,
  ) {}

  @Process(AgentCronTriggerCronJob.name)
  @SentryCronMonitor(
    AgentCronTriggerCronJob.name,
    AGENT_CRON_TRIGGER_CRON_PATTERN,
  )
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
        await this.dispatchDueCronTriggers({
          workspaceId: activeWorkspace.id,
          now,
        });
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

  private async dispatchDueCronTriggers({
    workspaceId,
    now,
  }: {
    workspaceId: string;
    now: Date;
  }) {
    const { flatAgentMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatAgentMaps'],
    );

    for (const { flatAgent, trigger } of findActiveAgentTriggers({
      flatAgentMaps,
      type: 'CRON',
    })) {
      const shouldDispatch =
        await this.cronTriggerDeduplicationService.shouldDispatch(
          `agent-cron:${workspaceId}:${flatAgent.id}:${trigger.id}`,
          trigger.settings.pattern,
          now,
        );

      if (!shouldDispatch) {
        continue;
      }

      const canRun = await this.agentTriggerThrottlerService.tryConsumeRuns({
        workspaceId,
        agentId: flatAgent.id,
        runCount: 1,
      });

      if (!canRun) {
        this.logger.warn(
          `Run limit reached for agent ${flatAgent.id} in workspace ${workspaceId}: skipping trigger ${trigger.id}`,
        );

        continue;
      }

      await this.messageQueueService.add<RunAgentTriggerJobData>(
        RunAgentTriggerJob.name,
        {
          workspaceId,
          agentId: flatAgent.id,
          triggerId: trigger.id,
          payload: { type: 'CRON', firedAt: now.toISOString() },
        },
      );
    }
  }
}
