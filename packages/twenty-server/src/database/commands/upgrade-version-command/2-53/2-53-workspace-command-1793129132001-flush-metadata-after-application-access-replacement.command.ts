import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// ReplaceApplicationMetadataAccessSlowInstanceCommand updates rows behind the flat-entity caches
@RegisteredWorkspaceCommand('2.53.0', 1793129132001)
@Command({
  name: 'upgrade:2-53:flush-metadata-after-application-access-replacement',
  description:
    'Flush the object and field metadata caches after APPLICATION readability and writability were replaced',
})
export class FlushMetadataAfterApplicationAccessReplacementCommand extends ProvisionedWorkspaceCommandRunner {
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
      getMetadataFlatEntityMapsKey('fieldMetadata'),
    ]);
  }
}
