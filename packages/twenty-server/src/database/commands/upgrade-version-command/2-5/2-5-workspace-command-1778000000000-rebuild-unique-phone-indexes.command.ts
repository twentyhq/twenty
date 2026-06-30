import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  computeFlatIndexFieldColumnNames,
  createIndexInWorkspaceSchema,
  dropIndexFromWorkspaceSchema,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const LEGACY_NON_EMPTY_PARTIAL_INDEX_PATTERN = /^"[a-zA-Z][a-zA-Z0-9]*" != ''$/;

@RegisteredWorkspaceCommand('2.5.0', 1778000000000)
@Command({
  name: 'upgrade:2-5:rebuild-unique-phone-indexes',
  description:
    'Rebuild unique phone field indexes to include the phone calling code column.',
})
export class RebuildUniquePhoneIndexesCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
    if (!dataSource) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatFieldMetadataMaps, flatIndexMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'flatObjectMetadataMaps',
      ]);

    const uniquePhoneIndexes = Object.values(
      flatIndexMaps.byUniversalIdentifier,
    ).filter((flatIndex): flatIndex is FlatIndexMetadata => {
      if (!isDefined(flatIndex) || !flatIndex.isUnique) {
        return false;
      }

      return flatIndex.flatIndexFieldMetadatas.some((indexField) => {
        const relatedField = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: indexField.fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        return relatedField?.type === FieldMetadataType.PHONES;
      });
    });

    if (uniquePhoneIndexes.length === 0) {
      this.logger.log(
        `No unique phone indexes found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would rebuild ${uniquePhoneIndexes.length} unique phone indexes for workspace ${workspaceId}: ${uniquePhoneIndexes
          .map((index) => index.name)
          .join(', ')}`,
      );

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

      for (const uniquePhoneIndex of uniquePhoneIndexes) {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: uniquePhoneIndex.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

        const hasLegacyNonEmptyPartialClause =
          isNonEmptyString(uniquePhoneIndex.indexWhereClause) &&
          LEGACY_NON_EMPTY_PARTIAL_INDEX_PATTERN.test(
            uniquePhoneIndex.indexWhereClause,
          );

        if (hasLegacyNonEmptyPartialClause) {
          const tableName = computeObjectTargetTable(flatObjectMetadata);
          const columns = computeFlatIndexFieldColumnNames({
            flatIndexFieldMetadatas: uniquePhoneIndex.flatIndexFieldMetadatas,
            flatFieldMetadataMaps,
          });

          for (const column of columns) {
            await queryRunner.query(
              `UPDATE "${schemaName}"."${tableName}"
                  SET "${column}" = NULL
                WHERE "${column}" = ''`,
            );
          }

          await queryRunner.query(
            `UPDATE "core"."indexMetadata"
                SET "indexWhereClause" = NULL
              WHERE id = $1`,
            [uniquePhoneIndex.id],
          );
        }

        await dropIndexFromWorkspaceSchema({
          indexName: uniquePhoneIndex.name,
          workspaceSchemaManagerService: this.workspaceSchemaManagerService,
          queryRunner,
          schemaName,
        });

        const flatIndexMetadataForRebuild: FlatIndexMetadata =
          hasLegacyNonEmptyPartialClause
            ? { ...uniquePhoneIndex, indexWhereClause: null }
            : uniquePhoneIndex;

        await createIndexInWorkspaceSchema({
          flatIndexMetadata: flatIndexMetadataForRebuild,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          workspaceSchemaManagerService: this.workspaceSchemaManagerService,
          queryRunner,
          workspaceId,
        });

        this.logger.log(
          `Rebuilt unique phone index ${uniquePhoneIndex.name} for workspace ${workspaceId}${hasLegacyNonEmptyPartialClause ? ' (dropped legacy non-empty partial WHERE clause)' : ''}`,
        );
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
  }
}
