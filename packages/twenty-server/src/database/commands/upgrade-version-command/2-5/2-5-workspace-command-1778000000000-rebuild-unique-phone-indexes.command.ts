import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  createIndexInWorkspaceSchema,
  dropIndexFromWorkspaceSchema,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

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

        await dropIndexFromWorkspaceSchema({
          indexName: uniquePhoneIndex.name,
          workspaceSchemaManagerService: this.workspaceSchemaManagerService,
          queryRunner,
          schemaName,
        });

        await createIndexInWorkspaceSchema({
          flatIndexMetadata: uniquePhoneIndex,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          workspaceSchemaManagerService: this.workspaceSchemaManagerService,
          queryRunner,
          workspaceId,
        });

        this.logger.log(
          `Rebuilt unique phone index ${uniquePhoneIndex.name} for workspace ${workspaceId}`,
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
