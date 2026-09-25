import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Expand step of the chat thread owner move. The legacy userWorkspaceId column
// stays untouched so servers that still read it keep working; the contract
// step removes it (twentyhq/core-team-issues#2925).
@RegisteredWorkspaceCommand('2.43.0', 1790338657365)
@Command({
  name: 'upgrade:2-43:link-chat-threads-to-workspace-members',
  description:
    'Add the chat thread workspaceMember owner and backfill it from userWorkspaceId',
})
export class LinkChatThreadsToWorkspaceMembersCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly schema: AgentHistorySchemaService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    // Workspaces without chat history objects get the new shape when the
    // 2.42 history move provisions them.
    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ],
      )
    ) {
      return;
    }

    await this.schema.prepare(workspaceId, dryRun);

    if (dryRun) {
      this.logger.log(
        `Would link chat threads to workspace members for ${workspaceId}`,
      );

      return;
    }

    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const linked: { id: string }[] = await this.dataSource.query(
      `UPDATE ${schemaName}."agentChatThread" thread
       SET "workspaceMemberId" = member.id
       FROM core."userWorkspace" membership
       JOIN ${schemaName}."workspaceMember" member
         ON member."userId" = membership."userId" AND member."deletedAt" IS NULL
       WHERE membership.id = thread."userWorkspaceId"
         AND membership."workspaceId" = $1
         AND thread."workspaceMemberId" IS NULL
       RETURNING thread.id`,
      [workspaceId],
    );

    this.logger.log(
      `Linked ${linked.length} chat thread(s) to workspace members for ${workspaceId}`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // The expand step only adds data next to the untouched legacy column.
  }
}
