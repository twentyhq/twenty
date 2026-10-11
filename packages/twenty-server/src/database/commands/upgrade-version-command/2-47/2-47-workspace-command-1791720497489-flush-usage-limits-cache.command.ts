import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// 2.45 and 2.46 servers shared the usageLimits cache key, so an entry computed
// by a 2.45 server can still hold meter-shaped limits without a unit
@RegisteredWorkspaceCommand('2.47.0', 1791720497489)
@Command({
  name: 'upgrade:2-47:flush-usage-limits-cache',
  description: 'Flush usage limits caches computed before the unit migration',
})
export class FlushUsageLimitsCacheCommand extends ProvisionedWorkspaceCommandRunner {
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
    if (options.dryRun) {
      return;
    }

    await this.workspaceCacheService.flush(workspaceId, ['usageLimits']);
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {}
}
