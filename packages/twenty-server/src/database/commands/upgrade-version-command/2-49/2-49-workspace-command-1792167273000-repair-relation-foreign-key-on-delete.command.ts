import { Command } from 'nest-commander';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeExpectedForeignKeyOnDelete } from 'src/database/commands/upgrade-version-command/2-49/utils/compute-expected-foreign-key-on-delete.util';
import { findWorkspaceForeignKeyOnDeleteRules } from 'src/database/commands/upgrade-version-command/2-49/utils/find-workspace-foreign-key-on-delete-rules.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.49.0', 1792167273000)
@Command({
  name: 'upgrade:2-49:repair-relation-foreign-key-on-delete',
  description:
    'Recreate MANY_TO_ONE relation foreign keys whose ON DELETE rule does not match the field onDelete setting',
})
export class RepairRelationForeignKeyOnDeleteCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const relations = Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(isMorphOrRelationFlatFieldMetadata)
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE,
      )
      .map((flatFieldMetadata) => {
        const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatFieldMetadata.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });
        const targetFlatObjectMetadata = isDefined(
          flatFieldMetadata.relationTargetObjectMetadataId,
        )
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
              flatEntityMaps: flatObjectMetadataMaps,
            })
          : undefined;

        if (
          !isDefined(sourceFlatObjectMetadata) ||
          !isDefined(targetFlatObjectMetadata)
        ) {
          return undefined;
        }

        return {
          tableName: computeObjectTargetTable(sourceFlatObjectMetadata),
          columnName: computeMorphOrRelationFieldJoinColumnName({
            name: flatFieldMetadata.name,
          }),
          referencedTableName: computeObjectTargetTable(
            targetFlatObjectMetadata,
          ),
          expectedOnDelete: computeExpectedForeignKeyOnDelete({
            onDelete: flatFieldMetadata.settings?.onDelete,
          }),
        };
      })
      .filter(isDefined);

    if (relations.length === 0) {
      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const foreignKeyRules = await findWorkspaceForeignKeyOnDeleteRules({
        queryRunner,
        schemaName,
        tableNames: [
          ...new Set(relations.map((relation) => relation.tableName)),
        ],
      });

      let repairedCount = 0;

      for (const {
        tableName,
        columnName,
        referencedTableName,
        expectedOnDelete,
      } of relations) {
        const foreignKeyRule = foreignKeyRules.get(`${tableName}.${columnName}`);

        if (
          !isDefined(foreignKeyRule) ||
          foreignKeyRule.onDeleteCode === expectedOnDelete.onDeleteCode
        ) {
          continue;
        }

        if (options.dryRun) {
          this.logger.log(
            `[DRY RUN] Would set ON DELETE ${expectedOnDelete.sqlAction} on ${schemaName}.${tableName}.${columnName} in workspace ${workspaceId}`,
          );

          continue;
        }

        await queryRunner.startTransaction();

        try {
          await this.workspaceSchemaManagerService.foreignKeyManager.dropForeignKey(
            {
              queryRunner,
              schemaName,
              tableName,
              foreignKeyName: foreignKeyRule.constraintName,
            },
          );

          await this.workspaceSchemaManagerService.foreignKeyManager.createForeignKey(
            {
              queryRunner,
              schemaName,
              foreignKey: {
                tableName,
                columnName,
                referencedTableName,
                referencedColumnName: 'id',
                onDelete: expectedOnDelete.sqlAction,
              },
            },
          );

          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();

          throw error;
        }

        repairedCount++;
      }

      if (repairedCount > 0) {
        this.logger.log(
          `Repaired ${repairedCount} relation foreign key(s) in workspace ${workspaceId}`,
        );
      }
    } finally {
      await queryRunner.release();
    }
  }

  async down({ workspaceId }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Nothing to revert for workspace ${workspaceId}: the replaced foreign keys did not match their field metadata`,
    );
  }
}
