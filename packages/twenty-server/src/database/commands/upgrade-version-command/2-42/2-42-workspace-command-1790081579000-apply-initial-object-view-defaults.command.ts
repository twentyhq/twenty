import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeInitialObjectViewDefaultUpdates } from 'src/engine/metadata-modules/view/utils/compute-initial-object-view-default-updates.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.42.0', 1790081579000)
@Command({
  name: 'upgrade:2-42:apply-initial-object-view-defaults',
  description:
    'Apply the per-object initial view type and position to the views the 2.41 backfill already seeded, leaving any view already at its target or changed since untouched.',
})
export class ApplyInitialObjectViewDefaultsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatViewMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatViewMaps'],
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const viewsToUpdate = computeInitialObjectViewDefaultUpdates({
      flatViewMaps,
      initialViewApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would update ${viewsToUpdate.length} initial object view(s) for workspace ${workspaceId}`,
      );

      return;
    }

    if (viewsToUpdate.length === 0) {
      this.logger.log(
        `No initial object view to update for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: viewsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Multiple validation errors occurred while applying initial object view defaults for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Updated ${viewsToUpdate.length} initial object view(s) for workspace ${workspaceId}`,
    );
  }
}
