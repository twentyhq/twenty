import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.61.0', 1795251708000)
@Command({
  name: 'upgrade:2-61:resync-access-groups-shared-by-value',
  description:
    'Resync access groups so value list rules use their groups shared by value',
})
export class ResyncAccessGroupsSharedByValueCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupSyncService: AccessGroupSyncService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (
      options.dryRun ||
      !featureFlagsMap[FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED]
    ) {
      return;
    }

    await this.accessGroupSyncService.syncAccessGroups(workspaceId);
  }
}
