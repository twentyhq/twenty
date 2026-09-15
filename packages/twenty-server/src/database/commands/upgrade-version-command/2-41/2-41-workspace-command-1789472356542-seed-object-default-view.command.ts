import { Command } from 'nest-commander';

import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeSeedObjectDefaultViewOperations } from 'src/engine/metadata-modules/view/utils/compute-seed-object-default-view-operations.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.41.0', 1789472356542)
@Command({
  name: 'upgrade:2-41:seed-object-default-view',
  description:
    'Seed one regular table view per object alongside its engine-owned INDEX view. The seeded view copies the INDEX view field layout once and is written with isSystemSideEffect: false under the workspace-custom application, so the user owns it and no application sync reaps it. The seeded view stays hidden from every read path until IS_SEEDED_DEFAULT_VIEW_ENABLED is on for the workspace, so this backfill can run long before the client is ready for it. Idempotent per entity on deterministic identifiers: the seeded view and each copied view field are gated independently, so a retry after a partial failure creates only what is missing. The command owns its orchestration and shares only the pure computation util with the provisioning paths (object creation and twenty-standard sync), so a workspace created after this release is seeded without the backfill running again.',
})
export class SeedObjectDefaultViewCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const seedOperations = computeSeedObjectDefaultViewOperations({
      flatObjectMetadatas: Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      ).filter(isDefined),
      flatViewMaps,
      flatViewFieldMaps,
      seededViewApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    const totalCreateCount =
      seedOperations.viewsToCreate.length +
      seedOperations.viewFieldsToCreate.length;

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would seed ${totalCreateCount} default-view entities for workspace ${workspaceId}`,
      );

      return;
    }

    if (totalCreateCount === 0) {
      this.logger.log(`No default view to seed for workspace ${workspaceId}`);

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
        `Multiple validation errors occurred while seeding default views for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Seeded ${totalCreateCount} default-view entities for workspace ${workspaceId}`,
    );
  }
}
