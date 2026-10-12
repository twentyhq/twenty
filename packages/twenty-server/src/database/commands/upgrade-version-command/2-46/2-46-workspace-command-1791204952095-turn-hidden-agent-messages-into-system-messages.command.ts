import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const getMessageTable = (workspaceId: string) =>
  `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentMessage"`;

// A hidden message was the context of a turn the agent opened: the workspace
// setup kickoff, or the opener of an application's inbox thread
@RegisteredWorkspaceCommand('2.46.0', 1791204952095)
@Command({
  name: 'upgrade:2-46:turn-hidden-agent-messages-into-system-messages',
  description: 'Turn hidden chat messages into system messages',
})
export class TurnHiddenAgentMessagesIntoSystemMessagesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    if (!(await this.hasChatHistory(workspaceId))) {
      this.logger.log(
        `agentChatThread object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would turn hidden chat messages into system messages for workspace ${workspaceId}`,
      );

      return;
    }

    const [, messageCount]: [unknown[], number] = await this.storage.run(
      workspaceId,
      ({ manager }) =>
        manager.query(
          `UPDATE ${getMessageTable(workspaceId)}
           SET role = 'system', "isHidden" = false
           WHERE "isHidden" = true AND role = 'user'`,
        ),
    );

    this.logger.log(
      `Workspace ${workspaceId}: turned ${messageCount} hidden chat message(s) into system messages`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    if (!(await this.hasChatHistory(workspaceId))) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would turn system chat messages back into hidden messages for workspace ${workspaceId}`,
      );

      return;
    }

    const [, messageCount]: [unknown[], number] = await this.storage.run(
      workspaceId,
      ({ manager }) =>
        manager.query(
          `UPDATE ${getMessageTable(workspaceId)}
           SET role = 'user', "isHidden" = true
           WHERE role = 'system'`,
        ),
    );

    this.logger.log(
      `Workspace ${workspaceId}: turned ${messageCount} system chat message(s) back into hidden messages`,
    );
  }

  // Workspaces without chat history objects have no hidden message
  private async hasChatHistory(workspaceId: string): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return isDefined(
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ],
    );
  }
}
