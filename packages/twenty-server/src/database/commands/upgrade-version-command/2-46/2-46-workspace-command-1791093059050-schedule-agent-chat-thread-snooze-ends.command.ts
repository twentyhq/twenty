import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-job-retry-options.constant';
import { END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job-name.constant';
import { type EndAgentChatThreadSnoozeJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job.types';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type PendingSnooze = {
  threadId: string;
  workspaceMemberId: string;
  snoozedUntil: Date;
  remainingDelay: number;
};

// Snoozes saved before snoozing queued its own end have nothing to bring the
// chat back to the inbox of an app that stays open
@RegisteredWorkspaceCommand('2.46.0', 1791093059050)
@Command({
  name: 'upgrade:2-46:schedule-agent-chat-thread-snooze-ends',
  description:
    'Queue the end of every chat snooze still pending, so open apps see the chat come back',
})
export class ScheduleAgentChatThreadSnoozeEndsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storage: AgentHistoryUpgradeStorageService,
    @InjectMessageQueue(MessageQueue.delayedJobsQueue)
    private readonly delayedJobsQueueService: MessageQueueService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    if (!(await this.hasParticipantObject(workspaceId))) {
      return;
    }

    const pendingSnoozes = await this.storage.run(workspaceId, ({ manager }) =>
      manager.query<PendingSnooze[]>(
        `SELECT "threadId", "workspaceMemberId", "snoozedUntil",
           CEIL(EXTRACT(EPOCH FROM "snoozedUntil" - clock_timestamp()) * 1000)::float8 AS "remainingDelay"
         FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentChatThreadParticipant"
         WHERE "archivedAt" IS NOT NULL AND "snoozedUntil" > clock_timestamp()`,
      ),
    );

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would queue the end of ${pendingSnoozes.length} chat snooze(s) for workspace ${workspaceId}`,
      );

      return;
    }

    // The end of a snooze the member changed since finds nothing to end
    for (const { remainingDelay, snoozedUntil, ...snooze } of pendingSnoozes) {
      await this.delayedJobsQueueService.add<EndAgentChatThreadSnoozeJobData>(
        END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME,
        { ...snooze, workspaceId, snoozedUntil: snoozedUntil.toISOString() },
        {
          delay: remainingDelay,
          ...AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS,
        },
      );
    }

    this.logger.log(
      `Workspace ${workspaceId}: queued the end of ${pendingSnoozes.length} chat snooze(s)`,
    );
  }

  // Queued ends only send what is already true by then, so there is nothing
  // to undo
  async down({ workspaceId }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Workspace ${workspaceId}: queued chat snooze ends are left to run`,
    );
  }

  private async hasParticipantObject(workspaceId: string): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return isDefined(
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
      ],
    );
  }
}
