import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// The 2.46 instance command rewrote databaseEventTriggerSettings in place, so
// cached flat logic functions still carry the single-object shape
@RegisteredWorkspaceCommand('2.46.0', 1791195525510)
@Command({
  name: 'upgrade:2-46:flush-logic-function-cache-for-database-event-triggers-list',
  description:
    'Flush cached flat logic functions so they reload with database event triggers stored as a list',
})
export class FlushLogicFunctionCacheForDatabaseEventTriggersListCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would flush the flat logic function cache of workspace ${workspaceId}`,
      );

      return;
    }

    await this.workspaceCacheService.flush(workspaceId, [
      'flatLogicFunctionMaps',
    ]);
  }
}
