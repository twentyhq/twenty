import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { computeMissingInitialObjectViewOperations } from 'src/engine/metadata-modules/view/utils/compute-missing-initial-object-view-operations.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.41.0', 1789565000000)
@Command({
  name: 'upgrade:2-41:seed-object-initial-view',
  description:
    'Seed one user-owned initial table view per object by copying its INDEX view field layout, hidden behind IS_INITIAL_OBJECT_VIEW_ENABLED and idempotent on deterministic identifiers.',
})
export class SeedObjectInitialViewCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatViewMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatViewMaps',
        'flatViewFieldMaps',
      ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const seedOperations = computeMissingInitialObjectViewOperations({
      flatObjectMetadatas: [
        twentyStandardFlatApplication.id,
        workspaceCustomFlatApplication.id,
      ].flatMap((applicationId) =>
        findFlatEntitiesByApplicationId({
          applicationId,
          flatEntityMaps: flatObjectMetadataMaps,
        }),
      ),
      flatViewMaps,
      flatViewFieldMaps,
      initialViewApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    const totalCreateCount =
      seedOperations.viewsToCreate.length +
      seedOperations.viewFieldsToCreate.length;

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would seed ${totalCreateCount} initial-view entities for workspace ${workspaceId}`,
      );

      return;
    }

    if (totalCreateCount === 0) {
      this.logger.log(`No initial view to seed for workspace ${workspaceId}`);

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
              flatEntityToCreate: seedOperations.viewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: seedOperations.viewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Multiple validation errors occurred while seeding initial object views for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Seeded ${totalCreateCount} initial-view entities for workspace ${workspaceId}`,
    );
  }
}
