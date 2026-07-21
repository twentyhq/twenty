import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildSearchFieldMetadataBackfillOperations } from 'src/database/commands/upgrade-version-command/2-20/utils/build-search-field-metadata-backfill-operations.util';
import {
  buildSearchFieldMetadataReOwnOperations,
  type SearchFieldMetadataUniversalIdentifierUpdate,
} from 'src/database/commands/upgrade-version-command/2-20/utils/build-search-field-metadata-re-own-operations.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type SearchFieldMetadataReconciliationOperations = {
  searchFieldMetadataUniversalIdentifierUpdates: SearchFieldMetadataUniversalIdentifierUpdate[];
  flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier: Record<
    string,
    UniversalFlatSearchFieldMetadata[]
  >;
};

@RegisteredWorkspaceCommand('2.20.0', 1783529458170)
@Command({
  name: 'upgrade:2-20:reconcile-search-field-metadata',
  description:
    'Converge every searchFieldMetadata universal identifier to its deterministic derivation (re-own, all applications) and create the missing searchFieldMetadata row for installed-app searchable objects (backfill). Idempotent, re-own runs before backfill to avoid a unique-identifier collision.',
})
export class ReconcileSearchFieldMetadataCommand extends ProvisionedWorkspaceCommandRunner {
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
      searchFieldMetadataUniversalIdentifierUpdates,
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    } = await this.computeOperations({ workspaceId });

    const totalRowsToBackfill = Object.values(
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    ).reduce(
      (total, flatSearchFieldMetadatas) =>
        total + flatSearchFieldMetadatas.length,
      0,
    );

    if (
      searchFieldMetadataUniversalIdentifierUpdates.length === 0 &&
      totalRowsToBackfill === 0
    ) {
      this.logger.log(
        `No searchFieldMetadata to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${searchFieldMetadataUniversalIdentifierUpdates.length} searchFieldMetadata universal identifier(s) and creating ${totalRowsToBackfill} missing row(s) across ${Object.keys(flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier).length} application(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.applyOperations({
      workspaceId,
      searchFieldMetadataUniversalIdentifierUpdates,
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    });

    this.logger.log(
      `Reconciled searchFieldMetadata for workspace ${workspaceId}`,
    );
  }

  private async computeOperations({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<SearchFieldMetadataReconciliationOperations> {
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

    const applicationUniversalIdentifierById = new Map(
      Object.values(flatApplicationMaps.byId)
        .filter(isDefined)
        .map((flatApplication) => [
          flatApplication.id,
          flatApplication.universalIdentifier,
        ]),
    );

    const searchFieldMetadataUniversalIdentifierUpdates =
      buildSearchFieldMetadataReOwnOperations({
        flatFieldMetadataMaps,
        flatSearchFieldMetadataMaps,
        applicationUniversalIdentifierById,
      });

    const flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatSearchFieldMetadataMaps,
        applicationUniversalIdentifierById,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      });

    return {
      searchFieldMetadataUniversalIdentifierUpdates,
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    };
  }

  private async applyOperations({
    workspaceId,
    searchFieldMetadataUniversalIdentifierUpdates,
    flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
  }: {
    workspaceId: string;
  } & SearchFieldMetadataReconciliationOperations): Promise<void> {
    // Re-own before backfill: a deterministic row created next to a surviving legacy v4
    // row (which the deletion-inference short-circuit keeps alive) would collide on the
    // unique universal identifier constraint.
    await this.applyReOwn({
      workspaceId,
      searchFieldMetadataUniversalIdentifierUpdates,
    });
    await this.applyBackfill({
      workspaceId,
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    });
  }

  private async applyReOwn({
    workspaceId,
    searchFieldMetadataUniversalIdentifierUpdates,
  }: {
    workspaceId: string;
    searchFieldMetadataUniversalIdentifierUpdates: SearchFieldMetadataUniversalIdentifierUpdate[];
  }): Promise<void> {
    if (searchFieldMetadataUniversalIdentifierUpdates.length === 0) {
      return;
    }

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
      // Abort before backfill: creating a deterministic row next to a surviving legacy
      // row (re-own rolled back) would collide on the unique universal identifier
      // constraint.
      this.logger.error(
        `Failed to re-own ${searchFieldMetadataUniversalIdentifierUpdates.length} searchFieldMetadata universal identifier(s) for workspace ${workspaceId}, aborting: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      throw error;
    }

    await this.flushSearchFieldMetadataCacheAndBumpMetadataVersion(workspaceId);
  }

  private async applyBackfill({
    workspaceId,
    flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
  }: {
    workspaceId: string;
    flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier: Record<
      string,
      UniversalFlatSearchFieldMetadata[]
    >;
  }): Promise<void> {
    for (const [
      applicationUniversalIdentifier,
      flatSearchFieldMetadatasToCreate,
    ] of Object.entries(
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    )) {
      if (flatSearchFieldMetadatasToCreate.length === 0) {
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
