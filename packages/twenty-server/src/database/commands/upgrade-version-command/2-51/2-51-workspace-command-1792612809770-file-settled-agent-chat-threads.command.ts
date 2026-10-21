import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Each batch commits on its own so a large workspace does not hold every
// participant row lock until the whole backfill is done
const PARTICIPANT_BATCH_SIZE = 1000;

// Filed just after the chat's last activity, so it reads as done since then
// and down can tell these archives from the member's own
const FILED_AT_SQL = `thread."lastActivityAt" + interval '1 microsecond'`;

// Open chats in a member's inbox, except those waiting on them: a question to
// answer, an assignment, a mention they have not read, or a snooze they set
// that has ended
const OPEN_SETTLED_PARTICIPANTS_SQL = `
  participant."isSubscribed"
  AND (participant."archivedAt" IS NULL OR thread."lastActivityAt" > participant."archivedAt")
  AND participant."snoozedUntil" IS NULL
  AND (participant."lastMentionedAt" IS NULL OR participant."lastReadAt" >= participant."lastMentionedAt")
  AND thread."lastActivityAt" IS NOT NULL
  AND thread."deletedAt" IS NULL
  AND thread."pendingQuestionMessageId" IS NULL
  AND thread."assigneeId" IS DISTINCT FROM participant."workspaceMemberId"`;

const FILED_PARTICIPANTS_SQL = `participant."archivedAt" = ${FILED_AT_SQL}`;

@RegisteredWorkspaceCommand('2.51.0', 1792612809770)
@Command({
  name: 'upgrade:2-51:file-settled-agent-chat-threads',
  description:
    "File the chats left open in members' inboxes before chats were filed on their own, keeping the ones waiting on the member",
})
export class FileSettledAgentChatThreadsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.updateParticipants({
      ...args,
      description: 'filed',
      matchingSql: OPEN_SETTLED_PARTICIPANTS_SQL,
      setSql: `"archivedAt" = ${FILED_AT_SQL}`,
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.updateParticipants({
      ...args,
      description: 'moved back to the inbox',
      matchingSql: FILED_PARTICIPANTS_SQL,
      setSql: `"archivedAt" = NULL`,
    });
  }

  private async updateParticipants({
    workspaceId,
    options,
    description,
    matchingSql,
    setSql,
  }: RunOnWorkspaceArgs & {
    description: string;
    matchingSql: string;
    setSql: string;
  }): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `agentChatThreadParticipant object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const fromSql = `${schemaName}."agentChatThreadParticipant" participant
       JOIN ${schemaName}."agentChatThread" thread ON thread.id = participant."threadId"
       WHERE ${matchingSql}`;

    if (options.dryRun ?? false) {
      const [{ count }]: { count: number }[] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM ${fromSql}`,
      );

      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${count} chat participant(s) would be ${description}`,
      );

      return;
    }

    let updatedCount = 0;

    for (;;) {
      const [, batchCount]: [unknown[], number] = await this.dataSource.query(
        `UPDATE ${schemaName}."agentChatThreadParticipant" target
         SET ${setSql}, "updatedAt" = now()
         FROM ${schemaName}."agentChatThread" thread
         WHERE thread.id = target."threadId"
           AND target.id IN (
             SELECT participant.id FROM ${fromSql}
             LIMIT ${PARTICIPANT_BATCH_SIZE}
           )`,
      );

      updatedCount += batchCount;

      if (batchCount < PARTICIPANT_BATCH_SIZE) {
        break;
      }
    }

    this.logger.log(
      `Workspace ${workspaceId}: ${updatedCount} chat participant(s) ${description}`,
    );
  }
}
