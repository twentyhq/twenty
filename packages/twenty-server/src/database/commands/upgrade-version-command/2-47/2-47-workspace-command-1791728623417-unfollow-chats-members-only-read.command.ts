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

// Members now follow a chat by taking part in it or filing it, rather than by
// being able to open it. A row that only records reading was written by the
// inbox backfill or by opening the chat, so its chat leaves the member's
// inbox. Rows used to stop following only when filed under done, so down
// follows again every row that does not follow and is not filed.
@RegisteredWorkspaceCommand('2.47.0', 1791728623417)
@Command({
  name: 'upgrade:2-47:unfollow-chats-members-only-read',
  description:
    'Stop following the chats a member only read, so they leave their inbox',
})
export class UnfollowChatsMembersOnlyReadCommand extends ProvisionedWorkspaceCommandRunner {
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
    if (!(await this.hasParticipantObject(workspaceId))) {
      return;
    }

    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const whereOnlyRead = `participant."isSubscribed"
         AND participant."archivedAt" IS NULL
         AND participant."snoozedUntil" IS NULL
         AND participant."lastMentionedAt" IS NULL
         AND participant."threadId" = thread.id
         AND participant."workspaceMemberId" IS DISTINCT FROM thread."workspaceMemberId"
         AND participant."workspaceMemberId" IS DISTINCT FROM thread."assigneeId"
         AND NOT participant."workspaceMemberId"::text = ANY(COALESCE(thread."writerWorkspaceMemberIds", '{}'))`;

    if (options.dryRun ?? false) {
      const [{ count }] = await this.dataSource.query<{ count: number }[]>(
        `SELECT COUNT(*)::int AS count
         FROM ${schemaName}."agentChatThreadParticipant" participant
         JOIN ${schemaName}."agentChatThread" thread ON ${whereOnlyRead}`,
      );

      this.logger.log(
        `[DRY RUN] Would unfollow ${count} chat(s) members only read in workspace ${workspaceId}`,
      );

      return;
    }

    const [, unfollowedCount]: [unknown[], number] =
      await this.dataSource.query(
        `UPDATE ${schemaName}."agentChatThreadParticipant" participant
         SET "isSubscribed" = false, "updatedAt" = now()
         FROM ${schemaName}."agentChatThread" thread
         WHERE ${whereOnlyRead}`,
      );

    this.logger.log(
      `Unfollowed ${unfollowedCount} chat(s) members only read in workspace ${workspaceId}`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    if (
      (options.dryRun ?? false) ||
      !(await this.hasParticipantObject(workspaceId))
    ) {
      return;
    }

    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    await this.dataSource.query(
      `UPDATE ${schemaName}."agentChatThreadParticipant"
       SET "isSubscribed" = true, "updatedAt" = now()
       WHERE NOT "isSubscribed" AND "archivedAt" IS NULL`,
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
