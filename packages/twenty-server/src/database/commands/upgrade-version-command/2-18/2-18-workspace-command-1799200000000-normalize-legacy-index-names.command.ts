import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { areIndexDefinitionsEquivalent } from 'src/database/commands/upgrade-version-command/2-18/utils/are-index-definitions-equivalent.util';
import { doesPhysicalIndexExist } from 'src/database/commands/upgrade-version-command/2-18/utils/does-physical-index-exist.util';
import { getPhysicalIndexDefinition } from 'src/database/commands/upgrade-version-command/2-18/utils/get-physical-index-definition.util';
import {
  type FlatIndexNameStatus,
  type IndexNameNormalizationOperation,
  planIndexNameNormalization,
  type RenameIndexNameOperation,
} from 'src/database/commands/upgrade-version-command/2-18/utils/plan-index-name-normalization.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  deleteIndexMetadata,
  dropIndexFromWorkspaceSchema,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';

@RegisteredWorkspaceCommand('2.18.0', 1799200000000)
@Command({
  name: 'upgrade:2-18:normalize-legacy-index-names',
  description:
    'Rename indexes whose stored name predates the v2 deterministic naming convention to their recomputed name, and drop redundant duplicates.',
})
export class NormalizeLegacyIndexNamesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    const operations =
      await this.computeIndexNameNormalizationOperations(workspaceId);

    if (operations.length === 0) {
      this.logger.log(
        `No legacy index names to normalize for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      for (const operation of operations) {
        if (operation.type === 'rename') {
          this.logger.log(
            `[DRY RUN] Would rename index ${operation.fromName} -> ${operation.toName} (workspace ${workspaceId})`,
          );
        } else {
          this.logger.log(
            `[DRY RUN] Would drop redundant duplicate index ${operation.redundantName} (kept ${operation.keptName}) (workspace ${workspaceId})`,
          );
        }
      }

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();
    let isQueryRunnerConnected = false;
    let isTransactionStarted = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      await queryRunner.startTransaction();
      isTransactionStarted = true;

      for (const [operationIndex, operation] of operations.entries()) {
        const savepointName = `index_name_normalization_${operationIndex}`;

        await queryRunner.query(`SAVEPOINT "${savepointName}"`);

        try {
          await this.applyIndexNameNormalizationOperation({
            queryRunner,
            schemaName,
            operation,
            workspaceId,
          });

          await queryRunner.query(`RELEASE SAVEPOINT "${savepointName}"`);
        } catch (error) {
          await queryRunner.query(`ROLLBACK TO SAVEPOINT "${savepointName}"`);

          this.logger.warn(
            `Skipping index name normalization for ${operation.type === 'rename' ? operation.fromName : operation.redundantName} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      if (isTransactionStarted) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    const indexRelatedFlatMapsKeys = [
      ...new Set(
        ['index' as const, ...getMetadataRelatedMetadataNames('index')].map(
          getMetadataFlatEntityMapsKey,
        ),
      ),
    ];

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      indexRelatedFlatMapsKeys,
    );
  }

  private async computeIndexNameNormalizationOperations(
    workspaceId: string,
  ): Promise<IndexNameNormalizationOperation[]> {
    const { flatIndexMaps, flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatIndexMaps',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const indexStatuses: FlatIndexNameStatus[] = [];

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      const objectIndexes =
        findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow(
          {
            flatEntityMaps: flatIndexMaps,
            universalIdentifiers:
              flatObjectMetadata.indexMetadataUniversalIdentifiers,
          },
        );

      if (objectIndexes.length === 0) {
        continue;
      }

      const objectFlatFieldMetadatas =
        findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow(
          {
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
          },
        );

      for (const flatIndex of objectIndexes) {
        try {
          const expectedName = generateFlatIndexMetadataWithNameOrThrow({
            flatObjectMetadata,
            objectFlatFieldMetadatas,
            flatIndex,
          }).name;

          indexStatuses.push({
            indexMetadataId: flatIndex.id,
            objectMetadataId: flatIndex.objectMetadataId,
            currentName: flatIndex.name,
            expectedName,
          });
        } catch (error) {
          this.logger.warn(
            `Could not recompute expected name for index ${flatIndex.name} (${flatIndex.id}) in workspace ${workspaceId}, skipping: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    return planIndexNameNormalization(indexStatuses);
  }

  private async applyIndexNameNormalizationOperation({
    queryRunner,
    schemaName,
    operation,
    workspaceId,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    operation: IndexNameNormalizationOperation;
    workspaceId: string;
  }): Promise<void> {
    if (operation.type === 'rename') {
      const targetIndexExists = await doesPhysicalIndexExist({
        queryRunner,
        schemaName,
        indexName: operation.toName,
      });

      if (targetIndexExists) {
        await this.reconcileRenameWithExistingTargetIndex({
          queryRunner,
          schemaName,
          operation,
          workspaceId,
        });
      } else {
        await this.renameIndexToExpectedName({
          queryRunner,
          schemaName,
          operation,
          workspaceId,
        });
      }

      await queryRunner.query(
        `UPDATE "core"."indexMetadata"
            SET "name" = $1
          WHERE "id" = $2
            AND "workspaceId" = $3`,
        [operation.toName, operation.indexMetadataId, workspaceId],
      );
    } else {
      await dropIndexFromWorkspaceSchema({
        indexName: operation.redundantName,
        workspaceSchemaManagerService: this.workspaceSchemaManagerService,
        queryRunner,
        schemaName,
      });

      await deleteIndexMetadata({
        entityId: operation.indexMetadataId,
        queryRunner,
        workspaceId,
      });

      this.logger.log(
        `Dropped redundant duplicate index ${operation.redundantName} (kept ${operation.keptName}) (workspace ${workspaceId})`,
      );
    }
  }

  // Target index already exists physically: the legacy index cannot be
  // renamed onto it. Metadata stops referencing the legacy index, so nothing
  // would ever clean it up: drop it when it is a true duplicate of the
  // target, keep it only when the definitions differ.
  private async reconcileRenameWithExistingTargetIndex({
    queryRunner,
    schemaName,
    operation,
    workspaceId,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    operation: RenameIndexNameOperation;
    workspaceId: string;
  }): Promise<void> {
    const sourceIndexExists = await doesPhysicalIndexExist({
      queryRunner,
      schemaName,
      indexName: operation.fromName,
    });

    if (!sourceIndexExists) {
      this.logger.log(
        `Index already physically named ${operation.toName}, reconciling metadata only (was ${operation.fromName}) (workspace ${workspaceId})`,
      );

      return;
    }

    const sourceIndexDefinition = await getPhysicalIndexDefinition({
      queryRunner,
      schemaName,
      indexName: operation.fromName,
    });
    const targetIndexDefinition = await getPhysicalIndexDefinition({
      queryRunner,
      schemaName,
      indexName: operation.toName,
    });

    if (
      isDefined(sourceIndexDefinition) &&
      isDefined(targetIndexDefinition) &&
      areIndexDefinitionsEquivalent({
        indexDefinitionA: sourceIndexDefinition,
        indexDefinitionB: targetIndexDefinition,
      })
    ) {
      await this.workspaceSchemaManagerService.indexManager.dropIndex({
        queryRunner,
        schemaName,
        indexName: operation.fromName,
      });

      this.logger.log(
        `Dropped duplicate legacy index ${operation.fromName} (identical definition already exists as ${operation.toName}) (workspace ${workspaceId})`,
      );
    } else {
      this.logger.warn(
        `Index ${operation.toName} already exists physically alongside ${operation.fromName} with a different definition; leaving ${operation.fromName} in place and pointing metadata at ${operation.toName} (workspace ${workspaceId})`,
      );
    }
  }

  // Target index does not exist physically: rename the legacy index in place
  // when present, otherwise only the metadata name will be updated so a
  // future rebuild uses the expected name.
  private async renameIndexToExpectedName({
    queryRunner,
    schemaName,
    operation,
    workspaceId,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    operation: RenameIndexNameOperation;
    workspaceId: string;
  }): Promise<void> {
    const sourceIndexExists = await doesPhysicalIndexExist({
      queryRunner,
      schemaName,
      indexName: operation.fromName,
    });

    if (!sourceIndexExists) {
      this.logger.warn(
        `Neither ${operation.fromName} nor ${operation.toName} exists physically; updating metadata name so a future rebuild uses the expected name (workspace ${workspaceId})`,
      );

      return;
    }

    await this.workspaceSchemaManagerService.indexManager.renameIndexWithoutRebuild(
      {
        queryRunner,
        schemaName,
        fromIndexName: operation.fromName,
        toIndexName: operation.toName,
      },
    );

    this.logger.log(
      `Renamed index ${operation.fromName} -> ${operation.toName} (workspace ${workspaceId})`,
    );
  }
}
