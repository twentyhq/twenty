import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  type FlatIndexNameStatus,
  planIndexNameNormalization,
} from 'src/database/commands/upgrade-version-command/2-16/utils/plan-index-name-normalization.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  deleteIndexMetadata,
  dropIndexFromWorkspaceSchema,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';

@RegisteredWorkspaceCommand('2.16.0', 1799200000000)
@Command({
  name: 'upgrade:2-16:normalize-legacy-index-names',
  description:
    'Rename indexes whose stored name predates the v2 deterministic naming convention to their recomputed name, and drop redundant duplicates.',
})
export class NormalizeLegacyIndexNamesCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const operations = planIndexNameNormalization(indexStatuses);

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

      for (const operation of operations) {
        if (operation.type === 'rename') {
          await this.workspaceSchemaManagerService.indexManager.renameIndexWithoutRebuild(
            {
              queryRunner,
              schemaName,
              fromIndexName: operation.fromName,
              toIndexName: operation.toName,
            },
          );

          await queryRunner.query(
            `UPDATE "core"."indexMetadata"
                SET "name" = $1
              WHERE "id" = $2
                AND "workspaceId" = $3`,
            [operation.toName, operation.indexMetadataId, workspaceId],
          );

          this.logger.log(
            `Renamed index ${operation.fromName} -> ${operation.toName} (workspace ${workspaceId})`,
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

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatIndexMaps',
      'flatFieldMetadataMaps',
    ]);
  }
}
