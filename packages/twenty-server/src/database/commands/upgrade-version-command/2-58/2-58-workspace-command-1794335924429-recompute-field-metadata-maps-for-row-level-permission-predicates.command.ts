import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { withDerivedFieldMetadataMaps } from 'src/engine/metadata-modules/flat-entity/utils/with-derived-field-metadata-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.58.0', 1794335924429)
@Command({
  name: 'upgrade:2-58:recompute-field-metadata-maps-for-row-level-permission-predicates',
  description:
    'Recompute the field metadata cache so fields list the row-level permission predicates that use them.',
})
export class RecomputeFieldMetadataMapsForRowLevelPermissionPredicatesCommand extends ProvisionedWorkspaceCommandRunner {
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
    if (options.dryRun ?? false) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      withDerivedFieldMetadataMaps(['flatFieldMetadataMaps']),
    );
  }
}
