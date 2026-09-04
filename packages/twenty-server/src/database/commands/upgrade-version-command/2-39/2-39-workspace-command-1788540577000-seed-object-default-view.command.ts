import { Command } from 'nest-commander';
import {
  getSeededObjectViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { computeSeededObjectViewToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-seeded-object-view-to-create.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type SeedOperations = {
  viewsToCreate: UniversalFlatView[];
  viewFieldsToCreate: UniversalFlatViewField[];
};

type SeedOperationsByApplication = Map<string, SeedOperations>;

@RegisteredWorkspaceCommand('2.39.0', 1788540577000)
@Command({
  name: 'upgrade:2-39:seed-object-default-view',
  description:
    'Seed one regular table view per object alongside its engine-owned INDEX view. The seeded view copies the INDEX view field layout once and is written with isSystemSideEffect: false under the workspace-custom application, so the user owns it and the twenty-standard sync does not reap it. Navigation resolves to it on the client, leaving the INDEX view as the neutral target that "See all" links filter against. Idempotent on the deterministic seeded identifier: an object that already has one is skipped.',
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

    const seedOperationsByApplication = this.computeSeedOperationsByApplication({
      flatObjectMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      seededViewApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    const totalCreateCount = [...seedOperationsByApplication.values()].reduce(
      (count, operations) =>
        count +
        operations.viewsToCreate.length +
        operations.viewFieldsToCreate.length,
      0,
    );

    if (totalCreateCount === 0) {
      this.logger.log(
        `No default view to seed for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Seeding ${totalCreateCount} default-view entit(ies) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.runSeedMigrations({ workspaceId, seedOperationsByApplication });

    this.logger.log(
      `Seeded ${totalCreateCount} default-view entit(ies) for workspace ${workspaceId}`,
    );
  }

  private computeSeedOperationsByApplication({
    flatObjectMetadataMaps,
    flatViewMaps,
    flatViewFieldMaps,
    seededViewApplicationUniversalIdentifier,
  }: Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatViewMaps' | 'flatViewFieldMaps'
  > & {
    seededViewApplicationUniversalIdentifier: string;
  }): SeedOperationsByApplication {
    const seedOperationsByApplication: SeedOperationsByApplication = new Map();

    const getApplicationBucket = (applicationUniversalIdentifier: string) => {
      const existingBucket = seedOperationsByApplication.get(
        applicationUniversalIdentifier,
      );

      if (isDefined(existingBucket)) {
        return existingBucket;
      }

      const newBucket: SeedOperations = {
        viewsToCreate: [],
        viewFieldsToCreate: [],
      };

      seedOperationsByApplication.set(
        applicationUniversalIdentifier,
        newBucket,
      );

      return newBucket;
    };

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatObjectMetadata) || flatObjectMetadata.isRemote) {
        continue;
      }

      const seededViewUniversalIdentifier =
        getSeededObjectViewUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        });

      if (
        isDefined(
          flatViewMaps.byUniversalIdentifier[seededViewUniversalIdentifier],
        )
      ) {
        continue;
      }

      const flatIndexView = this.findIndexViewForObject({
        flatObjectMetadata,
        flatViewMaps,
      });

      if (!isDefined(flatIndexView)) {
        continue;
      }

      const seededView = computeSeededObjectViewToCreate({
        objectMetadata: flatObjectMetadata,
        applicationUniversalIdentifier:
          seededViewApplicationUniversalIdentifier,
      });

      const applicationBucket = getApplicationBucket(
        seededViewApplicationUniversalIdentifier,
      );

      applicationBucket.viewsToCreate.push(seededView);

      for (const viewFieldUniversalIdentifier of flatIndexView.viewFieldUniversalIdentifiers) {
        const flatViewField =
          flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier];

        if (!isDefined(flatViewField)) {
          continue;
        }

        getApplicationBucket(
          seededViewApplicationUniversalIdentifier,
        ).viewFieldsToCreate.push({
          ...flatViewField,
          viewUniversalIdentifier: seededView.universalIdentifier,
          viewFieldGroupUniversalIdentifier: null,
          universalOverrides: null,
          applicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
          universalIdentifier: getViewFieldUniversalIdentifier({
            applicationUniversalIdentifier:
              seededViewApplicationUniversalIdentifier,
            viewUniversalIdentifier: seededView.universalIdentifier,
            fieldMetadataUniversalIdentifier:
              flatViewField.fieldMetadataUniversalIdentifier,
          }),
          isSystemSideEffect: false,
        });
      }
    }

    return seedOperationsByApplication;
  }

  private findIndexViewForObject({
    flatObjectMetadata,
    flatViewMaps,
  }: {
    flatObjectMetadata: UniversalFlatObjectMetadata;
    flatViewMaps: AllFlatEntityMaps['flatViewMaps'];
  }): UniversalFlatView | undefined {
    return Object.values(flatViewMaps.byUniversalIdentifier).find(
      (flatView) =>
        isDefined(flatView) &&
        flatView.key === ViewKey.INDEX &&
        flatView.deletedAt === null &&
        flatView.objectMetadataUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier,
    );
  }

  private async runSeedMigrations({
    workspaceId,
    seedOperationsByApplication,
  }: {
    workspaceId: string;
    seedOperationsByApplication: SeedOperationsByApplication;
  }): Promise<void> {
    for (const [
      applicationUniversalIdentifier,
      { viewsToCreate },
    ] of seedOperationsByApplication.entries()) {
      if (viewsToCreate.length === 0) {
        continue;
      }

      await this.runSeedMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          view: {
            flatEntityToCreate: viewsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }

    for (const [
      applicationUniversalIdentifier,
      { viewFieldsToCreate },
    ] of seedOperationsByApplication.entries()) {
      if (viewFieldsToCreate.length === 0) {
        continue;
      }

      await this.runSeedMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          viewField: {
            flatEntityToCreate: viewFieldsToCreate,
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
