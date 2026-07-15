import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildStandardSearchVectorGinIndexBackfillOperations } from 'src/database/commands/upgrade-version-command/2-22/utils/build-standard-search-vector-gin-index-backfill-operations.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.22.0', 1783950000000)
@Command({
  name: 'upgrade:2-22:backfill-standard-search-vector-gin-index',
  description:
    'Create the searchVector GIN index for twenty-standard searchable objects that declare it in the manifest but are missing it (the objects whose static declaration was only just added and previously relied on runtime side-effect creation). Idempotent.',
})
export class BackfillStandardSearchVectorGinIndexCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const flatIndexesToCreateByApplicationUniversalIdentifier =
      await this.computeOperations({ workspaceId });

    const totalIndexesToBackfill = Object.values(
      flatIndexesToCreateByApplicationUniversalIdentifier,
    ).reduce((total, flatIndexes) => total + flatIndexes.length, 0);

    if (totalIndexesToBackfill === 0) {
      this.logger.log(
        `No searchVector GIN index to backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling ${totalIndexesToBackfill} missing searchVector GIN index(es) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.applyBackfill({
      workspaceId,
      flatIndexesToCreateByApplicationUniversalIdentifier,
    });

    await this.flushIndexCacheAndBumpMetadataVersion(workspaceId);

    this.logger.log(
      `Backfilled searchVector GIN indexes for workspace ${workspaceId}`,
    );
  }

  private async computeOperations({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<Record<string, UniversalFlatIndexMetadata[]>> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return buildStandardSearchVectorGinIndexBackfillOperations({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });
  }

  private async applyBackfill({
    workspaceId,
    flatIndexesToCreateByApplicationUniversalIdentifier,
  }: {
    workspaceId: string;
    flatIndexesToCreateByApplicationUniversalIdentifier: Record<
      string,
      UniversalFlatIndexMetadata[]
    >;
  }): Promise<void> {
    for (const [
      applicationUniversalIdentifier,
      flatIndexesToCreate,
    ] of Object.entries(flatIndexesToCreateByApplicationUniversalIdentifier)) {
      if (flatIndexesToCreate.length === 0) {
        continue;
      }

      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            allFlatEntityOperationByMetadataName: {
              index: {
                flatEntityToCreate: flatIndexesToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
            workspaceId,
            applicationUniversalIdentifier,
          },
        );

      if (validateAndBuildResult.status === 'fail') {
        this.logger.error(
          `Failed to create searchVector GIN index(es) for application ${applicationUniversalIdentifier}:\n${JSON.stringify(
            validateAndBuildResult,
            null,
            2,
          )}`,
        );

        throw new Error(
          `Failed to create searchVector GIN index(es) for workspace ${workspaceId}`,
        );
      }
    }
  }

  private async flushIndexCacheAndBumpMetadataVersion(
    workspaceId: string,
  ): Promise<void> {
    const indexRelatedMetadataNames = [
      'index',
      ...getMetadataRelatedMetadataNames('index'),
      ...getMetadataSerializedRelationNames('index'),
    ] as const;
    const cacheKeysToFlush = [
      ...new Set(indexRelatedMetadataNames.map(getMetadataFlatEntityMapsKey)),
    ];

    await this.workspaceCacheService.flush(workspaceId, cacheKeysToFlush);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );
  }
}
