import { Command } from 'nest-commander';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { buildUserWorkspaceIdFromWorkspaceMemberIdSql } from 'src/engine/metadata-modules/ai/ai-history/utils/build-agent-chat-thread-owner-sql.util';
import { getAgentChatThreadOwnerColumn } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-column.util';

@RegisteredWorkspaceCommand('2.43.0', 1790171503075)
@Command({
  name: 'upgrade:2-43:attribute-chat-message-senders',
  description: 'Persist the original participant on historical chat messages',
})
export class AttributeChatMessageSendersCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly schema: AgentHistorySchemaService,
    private readonly storage: AgentHistoryStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    if (await this.storage.isEmptyUnprovisionedWorkspace(args.workspaceId)) {
      return;
    }
    await this.schema.prepare(args.workspaceId, args.options.dryRun ?? false);
    if (args.options.dryRun) {
      return;
    }
    await this.storage.run(
      args.workspaceId,
      async ({ manager, table, storage }) => {
        // Workspaces provisioned by the 2.42 move already own threads by member.
        const ownerColumn = await getAgentChatThreadOwnerColumn({
          manager,
          workspaceId: args.workspaceId,
          storage,
        });
        const ownerUserWorkspaceIdSql =
          ownerColumn === 'workspaceMemberId'
            ? buildUserWorkspaceIdFromWorkspaceMemberIdSql({
                workspaceId: args.workspaceId,
                workspaceMemberIdSql: 'thread."workspaceMemberId"',
                workspaceIdSql: '$1::uuid',
              })
            : 'thread."userWorkspaceId"';
        await manager.query(
          `UPDATE ${table('agentMessage')} message
         SET "senderUserWorkspaceId" = ${ownerUserWorkspaceIdSql}
         FROM ${table('agentChatThread')} thread
         WHERE message."threadId" = thread.id AND message.role = 'user'
           AND message."senderUserWorkspaceId" IS NULL
           ${storage === 'core' ? 'AND message."workspaceId" = $1 AND thread."workspaceId" = $1' : ''}`,
          storage === 'core' || ownerColumn === 'workspaceMemberId'
            ? [args.workspaceId]
            : [],
        );
      },
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // Older servers ignore these nullable fields. Retain authorship on rollback
    // so a later upgrade cannot reattribute another participant's messages.
  }
}
