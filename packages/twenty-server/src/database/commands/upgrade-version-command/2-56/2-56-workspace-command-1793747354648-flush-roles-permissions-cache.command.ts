import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// A role change handled by a pod on the previous version only invalidates the unversioned entry
@RegisteredWorkspaceCommand('2.56.0', 1793747354648)
@Command({
  name: 'upgrade:2-56:flush-roles-permissions-cache',
  description:
    'Flush the roles permissions cache once the rollout is done, so nothing cached during it outlives a role change',
})
export class FlushRolesPermissionsCacheCommand extends ProvisionedWorkspaceCommandRunner {
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
    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would flush the roles permissions cache`,
      );

      return;
    }

    await this.workspaceCacheService.flush(workspaceId, ['rolesPermissions']);
  }
}
