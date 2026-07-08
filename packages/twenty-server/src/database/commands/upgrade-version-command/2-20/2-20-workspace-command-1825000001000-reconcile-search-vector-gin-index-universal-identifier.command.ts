import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildSearchVectorGinIndexReconciliation } from 'src/database/commands/upgrade-version-command/2-20/utils/build-search-vector-gin-index-reconciliation.util';
import { getInstalledApplicationIds } from 'src/database/commands/upgrade-version-command/2-20/utils/get-installed-application-ids.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.20.0', 1825000001000)
@Command({
  name: 'upgrade:2-20:reconcile-search-vector-gin-index-universal-identifier',
  description:
    'Converge every searchVector GIN index universal identifier to its deterministic derivation (re-own, all applications) and create the missing GIN index for installed-app objects (create). Idempotent, re-own runs before create.',
})
export class ReconcileSearchVectorGinIndexUniversalIdentifierCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatApplicationMaps',
    ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatApplications = Object.values(flatApplicationMaps.byId).filter(
      isDefined,
    );
    const applicationUniversalIdentifierById = new Map(
      flatApplications.map((flatApplication) => [
        flatApplication.id,
        flatApplication.universalIdentifier,
      ]),
    );
    const installedApplicationIds = getInstalledApplicationIds({
      applicationIds: flatApplications.map((flatApplication) => flatApplication.id),
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
    });

    const {
      indexUniversalIdentifierUpdates,
      flatIndexesToCreateByApplicationUniversalIdentifier,
    } = buildSearchVectorGinIndexReconciliation({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      applicationUniversalIdentifierById,
      installedApplicationIds,
    });

    const applicationUniversalIdentifiersToCreate = Object.keys(
      flatIndexesToCreateByApplicationUniversalIdentifier,
    );
    const totalIndexesToCreate = applicationUniversalIdentifiersToCreate.reduce(
      (total, applicationUniversalIdentifier) =>
        total +
        (flatIndexesToCreateByApplicationUniversalIdentifier[
          applicationUniversalIdentifier
        ]?.length ?? 0),
      0,
    );

    if (
      indexUniversalIdentifierUpdates.length === 0 &&
      totalIndexesToCreate === 0
    ) {
      this.logger.log(
        `No searchVector GIN index to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${indexUniversalIdentifierUpdates.length} searchVector GIN index universal identifier(s) and creating ${totalIndexesToCreate} missing index(es) across ${applicationUniversalIdentifiersToCreate.length} application(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    // Re-own first: a deterministic v4 index re-created next to a surviving legacy
    // row would collide on the unique universal identifier constraint.
    if (indexUniversalIdentifierUpdates.length > 0) {
      try {
        await this.indexMetadataRepository.manager.transaction(
          async (entityManager) => {
            const transactionalIndexMetadataRepository =
              entityManager.getRepository(IndexMetadataEntity);

            for (const {
              id,
              deterministicUniversalIdentifier,
            } of indexUniversalIdentifierUpdates) {
              await transactionalIndexMetadataRepository.update(
                { id, workspaceId },
                { universalIdentifier: deterministicUniversalIdentifier },
              );
            }
          },
        );
      } catch (error) {
        // Stop before the create step: creating a deterministic index next to a
        // surviving legacy row (re-own rolled back) would collide on the unique
        // universal identifier constraint.
        this.logger.error(
          `Failed to re-own ${indexUniversalIdentifierUpdates.length} searchVector GIN index universal identifier(s) for workspace ${workspaceId}, aborting: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        throw error;
      }

      await this.flushIndexCacheAndBumpMetadataVersion(workspaceId);
    }

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiersToCreate) {
      const flatIndexesToCreate =
        flatIndexesToCreateByApplicationUniversalIdentifier[
          applicationUniversalIdentifier
        ];

      if (!isDefined(flatIndexesToCreate) || flatIndexesToCreate.length === 0) {
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

    this.logger.log(
      `Reconciled searchVector GIN indexes for workspace ${workspaceId}`,
    );
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
