import { Command } from 'nest-commander';
import { MetadataReadability } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.44.0', 1790590808102)
@Command({
  name: 'upgrade:2-44:verify-common-record-sharing',
  description:
    'Verify that conversation sharing completed before removing legacy access',
})
export class VerifyCommonRecordSharingCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    return this.up(args);
  }

  async up({ workspaceId }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const thread =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    if (thread?.readability === MetadataReadability.SYSTEM) {
      throw new Error(
        `Conversation sharing is incomplete for ${workspaceId}. Run upgrade:2-43:enable-common-record-sharing before serving this workspace.`,
      );
    }
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // A readiness check changes no data and must not restore legacy open access.
  }
}
