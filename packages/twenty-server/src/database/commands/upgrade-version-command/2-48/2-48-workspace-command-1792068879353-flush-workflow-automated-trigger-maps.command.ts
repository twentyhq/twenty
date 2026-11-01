import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.48.0', 1792068879353)
@Command({
  name: 'upgrade:2-48:flush-workflow-automated-trigger-maps',
  description:
    'Flush the cached workflow automated triggers so they are rebuilt with their application',
})
export class FlushWorkflowAutomatedTriggerMapsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    await this.flushWorkflowAutomatedTriggerMaps({ workspaceId, options });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    await this.flushWorkflowAutomatedTriggerMaps({ workspaceId, options });
  }

  private async flushWorkflowAutomatedTriggerMaps({
    workspaceId,
    options,
  }: Pick<RunOnWorkspaceArgs, 'workspaceId' | 'options'>): Promise<void> {
    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: flushing the cached workflow automated triggers`,
    );

    if (options.dryRun) {
      return;
    }

    await this.workspaceCacheService.flush(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
