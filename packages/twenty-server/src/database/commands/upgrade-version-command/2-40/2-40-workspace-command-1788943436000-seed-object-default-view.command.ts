import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import {
  type SeedOperations,
  computeSeedObjectDefaultViewOperations,
} from 'src/database/commands/upgrade-version-command/2-40/utils/compute-seed-object-default-view-operations.util';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.40.0', 1788943436000)
@Command({
  name: 'upgrade:2-40:seed-object-default-view',
  description:
    'Seed one regular table view per object alongside its engine-owned INDEX view. The seeded view copies the INDEX view field layout once and is written with isSystemSideEffect: false under the workspace-custom application, so the user owns it and no application sync reaps it. The INDEX view stays the neutral target that "See all" links filter against; pointing navigation at the seeded view is a separate client-side change. Idempotent per entity on deterministic identifiers: the seeded view and each copied view field are gated independently, so a retry after a partial failure creates only what is missing. Converges with objectSeededViewOnCreate, which seeds the same identifiers for workspace-custom objects at creation.',
})
export class SeedObjectDefaultViewCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

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
      flatObjectMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      seededViewApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    const totalCreateCount =
      seedOperations.viewsToCreate.length +
      seedOperations.viewFieldsToCreate.length;

    if (totalCreateCount === 0) {
      this.logger.log(
        `No default view to seed for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Seeding ${totalCreateCount} default-view entities for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.runSeedMigrations({
      workspaceId,
      seedOperations,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    this.logger.log(
      `Seeded ${totalCreateCount} default-view entities for workspace ${workspaceId}`,
    );
  }

  private async runSeedMigrations({
    workspaceId,
    seedOperations,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    seedOperations: SeedOperations;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    if (seedOperations.viewsToCreate.length > 0) {
      await this.runSeedMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          view: {
            flatEntityToCreate: seedOperations.viewsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }

    if (seedOperations.viewFieldsToCreate.length > 0) {
      await this.runSeedMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          viewField: {
            flatEntityToCreate: seedOperations.viewFieldsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }
  }

  private async runSeedMigration({
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityOperationByMetadataName,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to seed default view(s) for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to seed default view(s) for workspace ${workspaceId}`,
      );
    }
  }
}
