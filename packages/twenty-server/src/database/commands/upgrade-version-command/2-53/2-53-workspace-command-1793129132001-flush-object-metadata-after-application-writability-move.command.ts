import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// the 2.53 slow instance command updates object metadata rows behind this cache
@RegisteredWorkspaceCommand('2.53.0', 1793129132001)
@Command({
  name: 'upgrade:2-53:flush-object-metadata-after-application-writability-move',
  description:
    'Flush the object metadata cache after APPLICATION writability moved to disabled object permission actions',
})
export class FlushObjectMetadataAfterApplicationWritabilityMoveCommand extends ProvisionedWorkspaceCommandRunner {
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
      return;
    }

    await this.workspaceCacheService.flush(workspaceId, [
      getMetadataFlatEntityMapsKey('objectMetadata'),
    ]);
  }
}
