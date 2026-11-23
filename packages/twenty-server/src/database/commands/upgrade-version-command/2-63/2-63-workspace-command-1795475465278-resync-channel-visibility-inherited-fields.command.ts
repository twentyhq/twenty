import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ChannelVisibilityRuleSyncSchedulerService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync-scheduler.service';

@RegisteredWorkspaceCommand('2.63.0', 1795475465278)
@Command({
  name: 'upgrade:2-63:resync-channel-visibility-inherited-fields',
  description:
    'Schedule the channel visibility sync so individual roles declare the thread subject as inherited from the message subject',
})
export class ResyncChannelVisibilityInheritedFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly channelVisibilityRuleSyncSchedulerService: ChannelVisibilityRuleSyncSchedulerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would schedule the channel visibility sync of workspace ${workspaceId}`,
      );

      return;
    }

    await this.channelVisibilityRuleSyncSchedulerService.scheduleSyncIfEnabled(
      workspaceId,
    );
  }
}
