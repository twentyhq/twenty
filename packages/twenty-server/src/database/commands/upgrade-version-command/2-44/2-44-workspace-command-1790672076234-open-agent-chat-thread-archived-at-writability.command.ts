import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.44.0', 1790672076234)
@Command({
  name: 'upgrade:2-44:open-agent-chat-thread-archived-at-writability',
  description:
    'Let the record API archive and unarchive conversations by making agentChatThread.archivedAt writable',
})
export class OpenAgentChatThreadArchivedAtWritabilityCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setWritability(args, 'OPEN');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setWritability(args, 'SYSTEM');
  }

  // The legacy column is the marker the chat record model move checks before moving archived chats
  private async setWritability(
    { workspaceId, options }: RunOnWorkspaceArgs,
    writability: 'OPEN' | 'SYSTEM',
  ): Promise<void> {
    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: setting agentChatThread.archivedAt writability to ${writability}`,
    );

    if (options.dryRun) {
      return;
    }

    await this.coreDataSource.query(
      `UPDATE core."fieldMetadata" SET writability = $3
        WHERE "workspaceId" = $1 AND "universalIdentifier" = $2 AND writability <> $3`,
      [
        workspaceId,
        STANDARD_OBJECTS.agentChatThread.fields.archivedAt.universalIdentifier,
        writability,
      ],
    );
  }
}
