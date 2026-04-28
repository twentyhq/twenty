import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';

// Backfill: rolls `isPreInstalled=true` registrations out to workspaces
// that existed before the flag was flipped. Idempotent.
@Command({
  name: 'install-pre-installed-apps',
  description:
    'Install every application registration flagged `isPreInstalled` on every active and suspended workspace. Idempotent.',
})
export class InstallPreInstalledAppsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly preInstalledAppsService: PreInstalledAppsService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Installing pre-installed apps on workspace ${workspaceId} (${index + 1}/${total})`,
    );

    if (dryRun) {
      return;
    }

    await this.preInstalledAppsService.installOnWorkspace(workspaceId);
  }
}
