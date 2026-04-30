import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';

// Re-runs the standard-application sync after we added the FIELDS_WIDGET
// view that backs the OpportunityMilestone record-page layout widget.
// Without this re-run, the page-layout widget's `configuration.viewId`
// stays null on workspaces that already passed through the original
// sync command (timestamp 1795000003000), and the layout editor errors
// with "Fields widget has no associated view".
//
// The sync service is idempotent — workspaces that already match the
// desired state get a no-op migration.
@RegisteredWorkspaceCommand('2.1.0', 1795000004000)
@Command({
  name: 'upgrade:2-1:resync-twenty-standard-application-spv',
  description:
    'Re-sync twenty-standard application across existing workspaces so newly added FIELDS_WIDGET views (OpportunityMilestone record page) materialize.',
})
export class ResyncTwentyStandardApplicationSpvCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
