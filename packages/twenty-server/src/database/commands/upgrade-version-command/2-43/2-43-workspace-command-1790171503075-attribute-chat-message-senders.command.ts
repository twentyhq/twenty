import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { isEmptyUnprovisionedAgentHistoryWorkspace } from 'src/database/commands/upgrade-version-command/2-43/utils/is-empty-unprovisioned-agent-history-workspace.util';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';

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
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    if (
      await isEmptyUnprovisionedAgentHistoryWorkspace({
        dataSource: this.dataSource,
        agentHistoryStorageService: this.storage,
        workspaceId: args.workspaceId,
      })
    ) {
      return;
    }
    await this.schema.prepare(args.workspaceId, args.options.dryRun ?? false);
    if (args.options.dryRun) {
      return;
    }
    // The 2.42 history move has already routed this workspace to its own
    // schema, so there is no core-stored history left to attribute here.
    await this.storage.run(args.workspaceId, async ({ manager, table }) => {
      await manager.query(
        `UPDATE ${table('agentMessage')} message
         SET "senderUserWorkspaceId" = thread."userWorkspaceId"
         FROM ${table('agentChatThread')} thread
         WHERE message."threadId" = thread.id AND message.role = 'user'
           AND message."senderUserWorkspaceId" IS NULL`,
      );
    });
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // Older servers ignore these nullable fields. Retain authorship on rollback
    // so a later upgrade cannot reattribute another participant's messages.
  }
}
