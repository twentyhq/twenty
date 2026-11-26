import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ChannelVisibilityRoleWideAccessRevokeService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-role-wide-access-revoke.service';
import { ChannelVisibilityRuleSyncService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.64.0', 1795648952060)
@Command({
  name: 'upgrade:2-64:revoke-role-wide-access-to-channel-objects',
  description:
    'Write the channel visibility rules of every workspace member, then revoke the role wide access of user roles to message and calendar objects',
})
export class RevokeRoleWideAccessToChannelObjectsUpgradeCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly channelVisibilityRuleSyncService: ChannelVisibilityRuleSyncService,
    private readonly channelVisibilityRoleWideAccessRevokeService: ChannelVisibilityRoleWideAccessRevokeService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const hasWorkspaceMembers = isDefined(
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workspaceMember.universalIdentifier
      ],
    );

    if (!isDryRun && hasWorkspaceMembers) {
      await this.channelVisibilityRuleSyncService.syncWorkspace(workspaceId);
    }

    await this.channelVisibilityRoleWideAccessRevokeService.revokeRoleWideAccess(
      { workspaceId, isDryRun },
    );
  }
}
