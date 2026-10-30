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

// Each batch commits on its own so a large workspace never holds every row lock at once
const PARTICIPANT_BATCH_SIZE = 1000;

// Just after the last activity, so down can tell these archives from the member's own
const FILED_AT_SQL = `thread."lastActivityAt" + interval '1 microsecond'`;

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

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    await this.setArchivedAtInBatches({
      workspaceId,
      isDryRun: options.dryRun ?? false,
      matchingSql: OPEN_SETTLED_PARTICIPANTS_SQL,
      archivedAtSql: FILED_AT_SQL,
      outcome: 'filed',
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    await this.setArchivedAtInBatches({
      workspaceId,
      isDryRun: options.dryRun ?? false,
      matchingSql: FILED_PARTICIPANTS_SQL,
      archivedAtSql: 'NULL',
      outcome: 'moved back to the inbox',
    });
  }

  private async setArchivedAtInBatches({
    workspaceId,
    isDryRun,
    matchingSql,
    archivedAtSql,
    outcome,
  }: {
    workspaceId: string;
    isDryRun: boolean;
    matchingSql: string;
    archivedAtSql: string;
    outcome: string;
  }): Promise<void> {
    if (!(await this.hasParticipantObject(workspaceId))) {
      this.logger.log(
        `agentChatThreadParticipant object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const matchingParticipantsSql = `${schemaName}."agentChatThreadParticipant" participant
       JOIN ${schemaName}."agentChatThread" thread ON thread.id = participant."threadId"
       WHERE ${matchingSql}`;

    if (isDryRun) {
      const [{ count }] = await this.dataSource.query<{ count: number }[]>(
        `SELECT COUNT(*)::int AS count FROM ${matchingParticipantsSql}`,
      );

      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${count} chat participant(s) would be ${outcome}`,
      );

      return;
    }

    let updatedCount = 0;
    let batchCount: number;

    do {
      [, batchCount] = await this.dataSource.query<[unknown[], number]>(
        `UPDATE ${schemaName}."agentChatThreadParticipant" target
         SET "archivedAt" = ${archivedAtSql}, "updatedAt" = now()
         FROM ${schemaName}."agentChatThread" thread
         WHERE thread.id = target."threadId"
           AND target.id IN (
             SELECT participant.id FROM ${matchingParticipantsSql}
             LIMIT ${PARTICIPANT_BATCH_SIZE}
           )`,
      );

      updatedCount += batchCount;
    } while (batchCount === PARTICIPANT_BATCH_SIZE);

    this.logger.log(
      `Workspace ${workspaceId}: ${updatedCount} chat participant(s) ${outcome}`,
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
