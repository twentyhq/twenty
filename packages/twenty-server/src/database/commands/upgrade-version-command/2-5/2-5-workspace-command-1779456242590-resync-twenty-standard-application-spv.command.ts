import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';

// Re-runs the standard-application sync after adding the
// taskTarget ↔ opportunityMilestone morph relation (and the inverse
// `taskTargets` field on opportunityMilestone). Without this re-run,
// existing workspaces lack the `targetOpportunityMilestoneId` column
// on taskTarget and the front-end "Tasks" tab on a milestone returns
// 400 ("taskTarget object doesn't have any targetOpportunityMilestoneId field").
//
// The sync service is idempotent — workspaces that already match the
// desired state get a no-op migration.
@RegisteredWorkspaceCommand('2.5.0', 1779456242590)
@Command({
  name: 'upgrade:2-5:resync-twenty-standard-application-spv',
  description:
    'Re-sync twenty-standard application across existing workspaces so the new taskTarget ↔ opportunityMilestone relation materializes.',
})
export class ResyncTwentyStandardApplicationSpvV25Command extends ActiveOrSuspendedWorkspaceCommandRunner {
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
        `[DRY RUN] Would re-sync twenty-standard application for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Re-syncing twenty-standard application for workspace ${workspaceId}`,
    );

    await this.twentyStandardApplicationService.synchronizeTwentyStandardApplicationOrThrow(
      { workspaceId },
    );

    this.logger.log(
      `Re-synced twenty-standard application for workspace ${workspaceId}`,
    );
  }
}
