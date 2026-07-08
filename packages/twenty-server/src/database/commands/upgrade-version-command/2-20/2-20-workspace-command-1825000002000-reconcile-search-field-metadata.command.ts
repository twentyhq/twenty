import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildSearchFieldMetadataReconciliation } from 'src/database/commands/upgrade-version-command/2-20/utils/build-search-field-metadata-reconciliation.util';
import { getInstalledApplicationIds } from 'src/database/commands/upgrade-version-command/2-20/utils/get-installed-application-ids.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.20.0', 1825000002000)
@Command({
  name: 'upgrade:2-20:reconcile-search-field-metadata',
  description:
    'Converge every searchFieldMetadata universal identifier to its deterministic derivation (re-own, all applications) and create the missing searchFieldMetadata row for installed-app searchable objects (create). Idempotent, re-own runs before create to avoid a unique-identifier collision.',
})
export class ReconcileSearchFieldMetadataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(SearchFieldMetadataEntity)
    private readonly searchFieldMetadataRepository: Repository<SearchFieldMetadataEntity>,
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
      flatSearchFieldMetadataMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatSearchFieldMetadataMaps',
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
      searchFieldMetadataUniversalIdentifierUpdates,
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    } = buildSearchFieldMetadataReconciliation({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatSearchFieldMetadataMaps,
      applicationUniversalIdentifierById,
      installedApplicationIds,
    });

    const applicationUniversalIdentifiersToCreate = Object.keys(
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    );
    const totalRowsToCreate = applicationUniversalIdentifiersToCreate.reduce(
      (total, applicationUniversalIdentifier) =>
        total +
        (flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
          applicationUniversalIdentifier
        ]?.length ?? 0),
      0,
    );

    if (
      searchFieldMetadataUniversalIdentifierUpdates.length === 0 &&
      totalRowsToCreate === 0
    ) {
      this.logger.log(
        `No searchFieldMetadata to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${searchFieldMetadataUniversalIdentifierUpdates.length} searchFieldMetadata universal identifier(s) and creating ${totalRowsToCreate} missing row(s) across ${applicationUniversalIdentifiersToCreate.length} application(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    // Re-own first: a deterministic row created next to a surviving legacy v4 row
    // (which the deletion-inference short-circuit keeps alive) would collide on the
    // unique universal identifier constraint.
    if (searchFieldMetadataUniversalIdentifierUpdates.length > 0) {
      try {
        await this.searchFieldMetadataRepository.manager.transaction(
          async (entityManager) => {
            const transactionalSearchFieldMetadataRepository =
              entityManager.getRepository(SearchFieldMetadataEntity);

            for (const {
              id,
              deterministicUniversalIdentifier,
            } of searchFieldMetadataUniversalIdentifierUpdates) {
              await transactionalSearchFieldMetadataRepository.update(
                { id, workspaceId },
                { universalIdentifier: deterministicUniversalIdentifier },
              );
            }
          },
        );
      } catch (error) {
        // Stop before the create step: creating a deterministic row next to a
        // surviving legacy row (re-own rolled back) would collide on the unique
        // universal identifier constraint.
        this.logger.error(
          `Failed to re-own ${searchFieldMetadataUniversalIdentifierUpdates.length} searchFieldMetadata universal identifier(s) for workspace ${workspaceId}, aborting: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        throw error;
      }

      await this.flushSearchFieldMetadataCacheAndBumpMetadataVersion(
        workspaceId,
      );
    }

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiersToCreate) {
      const flatSearchFieldMetadatasToCreate =
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
          applicationUniversalIdentifier
        ];

      if (
        !isDefined(flatSearchFieldMetadatasToCreate) ||
        flatSearchFieldMetadatasToCreate.length === 0
      ) {
        continue;
      }

      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            allFlatEntityOperationByMetadataName: {
              searchFieldMetadata: {
                flatEntityToCreate: flatSearchFieldMetadatasToCreate,
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
          `Failed to create searchFieldMetadata row(s) for application ${applicationUniversalIdentifier}:\n${JSON.stringify(
            validateAndBuildResult,
            null,
            2,
          )}`,
        );

        throw new Error(
          `Failed to create searchFieldMetadata row(s) for workspace ${workspaceId}`,
        );
      }
    }

    this.logger.log(
      `Reconciled searchFieldMetadata for workspace ${workspaceId}`,
    );
  }

  private async flushSearchFieldMetadataCacheAndBumpMetadataVersion(
    workspaceId: string,
  ): Promise<void> {
    const searchFieldMetadataRelatedMetadataNames = [
      'searchFieldMetadata',
      ...getMetadataRelatedMetadataNames('searchFieldMetadata'),
      ...getMetadataSerializedRelationNames('searchFieldMetadata'),
    ] as const;
    const cacheKeysToFlush = [
      ...new Set(
        searchFieldMetadataRelatedMetadataNames.map(getMetadataFlatEntityMapsKey),
      ),
    ];

    await this.workspaceCacheService.flush(workspaceId, cacheKeysToFlush);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );
  }
}
