import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { generateDeterministicIndexForFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-deterministic-index-for-flat-field-metadata-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isPrimaryKeyFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-primary-key-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  WorkspaceSchemaManagerException,
  WorkspaceSchemaManagerExceptionCode,
} from 'src/engine/twenty-orm/workspace-schema-manager/exceptions/workspace-schema-manager.exception';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { computeFlatIndexFieldColumnNames } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

type IndexToBuild = {
  flatIndexMetadata: UniversalFlatIndexMetadata;
  tableName: string;
  columns: string[];
};

type IndexOperations = {
  flatEntityToCreate: UniversalFlatIndexMetadata[];
  flatEntityToDelete: FlatIndexMetadata[];
};

@RegisteredWorkspaceCommand('2.59.0', 1794498818636)
@Command({
  name: 'upgrade:2-59:exclude-deleted-records-from-unique-field-indexes',
  description:
    'Replace the index backing each unique field with a partial index on non-deleted records',
})
export class ExcludeDeletedRecordsFromUniqueFieldIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const indexesToBuild: IndexToBuild[] = [];
    const indexOperationsByApplicationUniversalIdentifier = new Map<
      string,
      IndexOperations
    >();
    const getIndexOperations = (applicationUniversalIdentifier: string) => {
      const indexOperations =
        indexOperationsByApplicationUniversalIdentifier.get(
          applicationUniversalIdentifier,
        ) ?? { flatEntityToCreate: [], flatEntityToDelete: [] };

      indexOperationsByApplicationUniversalIdentifier.set(
        applicationUniversalIdentifier,
        indexOperations,
      );

      return indexOperations;
    };

    for (const legacyFlatIndexMetadata of Object.values(
      flatIndexMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(legacyFlatIndexMetadata) ||
        !legacyFlatIndexMetadata.isUnique ||
        isNonEmptyString(legacyFlatIndexMetadata.indexWhereClause) ||
        legacyFlatIndexMetadata.flatIndexFieldMetadatas.length !== 1
      ) {
        continue;
      }

      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId:
          legacyFlatIndexMetadata.flatIndexFieldMetadatas[0].fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: legacyFlatIndexMetadata.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (
        !isDefined(flatFieldMetadata) ||
        !isDefined(flatObjectMetadata) ||
        !flatFieldMetadata.isUnique ||
        isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
        isPrimaryKeyFlatFieldMetadata(flatFieldMetadata)
      ) {
        continue;
      }

      const isOwnedByUniqueField =
        legacyFlatIndexMetadata.universalIdentifier ===
        getIndexUniversalIdentifier({
          applicationUniversalIdentifier:
            flatFieldMetadata.applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          name: legacyFlatIndexMetadata.name,
        });

      if (!isOwnedByUniqueField) {
        continue;
      }

      const replacementFlatIndexMetadata =
        generateDeterministicIndexForFlatFieldMetadataOrThrow({
          flatFieldMetadata,
          flatObjectMetadata,
        });

      getIndexOperations(
        legacyFlatIndexMetadata.applicationUniversalIdentifier,
      ).flatEntityToDelete.push(legacyFlatIndexMetadata);

      if (
        !isDefined(
          flatIndexMaps.byUniversalIdentifier[
            replacementFlatIndexMetadata.universalIdentifier
          ],
        )
      ) {
        getIndexOperations(
          replacementFlatIndexMetadata.applicationUniversalIdentifier,
        ).flatEntityToCreate.push(replacementFlatIndexMetadata);
        indexesToBuild.push({
          flatIndexMetadata: replacementFlatIndexMetadata,
          tableName: getWorkspaceSchemaContextForMigration({
            workspaceId,
            objectMetadata: flatObjectMetadata,
          }).tableName,
          columns: computeFlatIndexFieldColumnNames({
            flatIndexFieldMetadatas:
              legacyFlatIndexMetadata.flatIndexFieldMetadatas,
            flatFieldMetadataMaps,
          }),
        });
      }
    }

    if (!options.dryRun) {
      await this.buildIndexesConcurrently({
        workspaceId,
        dataSource,
        indexesToBuild,
      });
    }

    for (const [
      applicationUniversalIdentifier,
      indexOperations,
    ] of indexOperationsByApplicationUniversalIdentifier) {
      const indexNames = [
        ...indexOperations.flatEntityToDelete,
        ...indexOperations.flatEntityToCreate,
      ]
        .map(({ name }) => name)
        .join(', ');

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would replace unique field indexes for workspace ${workspaceId}: ${indexNames}`,
        );
        continue;
      }

      const migrationArgs = {
        shouldDeferActions: false,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        workspaceId,
        allFlatEntityOperationByMetadataName: {
          index: { ...indexOperations, flatEntityToUpdate: [] },
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          doNotTranslate(
            `Failed to replace unique field indexes for workspace ${workspaceId}`,
          ),
        );
      }

      this.logger.log(
        `Replaced unique field indexes for workspace ${workspaceId}: ${indexNames}`,
      );
    }
  }

  private async buildIndexesConcurrently({
    workspaceId,
    dataSource,
    indexesToBuild,
  }: {
    workspaceId: string;
    dataSource: DataSource;
    indexesToBuild: IndexToBuild[];
  }): Promise<void> {
    if (indexesToBuild.length === 0) {
      return;
    }

    if (dataSource.options.type !== 'postgres') {
      throw new WorkspaceSchemaManagerException(
        `Concurrent index builds need a postgres datasource, got ${dataSource.options.type}`,
        WorkspaceSchemaManagerExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const indexBuildDataSource = await new DataSource({
      ...dataSource.options,
      entities: [],
      migrations: [],
      subscribers: [],
      poolSize: 1,
      extra: { ...dataSource.options.extra, query_timeout: undefined },
    }).initialize();

    try {
      const queryRunner = indexBuildDataSource.createQueryRunner();

      await queryRunner.connect();

      const invalidIndexes: { name: string }[] = await queryRunner.query(
        `SELECT c.relname AS name
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname = ANY($2) AND NOT i.indisvalid`,
        [
          schemaName,
          indexesToBuild.map(({ flatIndexMetadata }) => flatIndexMetadata.name),
        ],
      );

      for (const { name } of invalidIndexes) {
        await this.workspaceSchemaManagerService.indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName: name,
        });
      }

      for (const { flatIndexMetadata, tableName, columns } of indexesToBuild) {
        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: flatIndexMetadata.name,
            columns,
            isUnique: flatIndexMetadata.isUnique,
            type: flatIndexMetadata.indexType,
            where: flatIndexMetadata.indexWhereClause ?? undefined,
          },
          concurrently: true,
        });
      }
    } finally {
      await indexBuildDataSource.destroy();
    }
  }
}
