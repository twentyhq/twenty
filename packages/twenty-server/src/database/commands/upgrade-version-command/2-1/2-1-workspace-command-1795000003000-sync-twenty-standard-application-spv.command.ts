import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';

// SPV fork: replays the standard-application sync for every existing
// workspace so the new OpportunityMilestone + OpportunityMilestoneDependency
// objects (and their fields, views, page layouts) materialize without a
// workspace re-init. The sync is a no-op for workspaces that already match
// the desired state, so re-running it is safe.
@RegisteredWorkspaceCommand('2.1.0', 1795000003000)
@Command({
  name: 'upgrade:2-1:sync-twenty-standard-application-spv',
  description:
    'Sync the twenty-standard application across existing workspaces so new SPV standard objects (OpportunityMilestone, dependencies) appear without a re-init.',
})
export class SyncTwentyStandardApplicationSpvCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly twentyStandardApplicationService: TwentyStandardApplicationService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would sync twenty-standard application for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Syncing twenty-standard application for workspace ${workspaceId}`,
    );

    await this.twentyStandardApplicationService.synchronizeTwentyStandardApplicationOrThrow(
      { workspaceId },
    );

    this.logger.log(
      `Synced twenty-standard application for workspace ${workspaceId}`,
    );
  }
}
