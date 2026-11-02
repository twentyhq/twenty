import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

// Objects whose records could be restricted by an everyone row before records became private one by one
const isRestrictableObject = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'isSystem' | 'universalIdentifier'>,
): boolean =>
  !flatObjectMetadata.isSystem && !isPermissionStorageObject(flatObjectMetadata);

@RegisteredWorkspaceCommand('2.55.0', 1793457458179)
@Command({
  name: 'upgrade:2-55:make-restricted-records-private',
  description:
    'Turn records restricted to the people with access into private records, drop the everyone rows that restricted them, then enable private records for the workspace',
})
export class MakeRestrictedRecordsPrivateCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner('master');
    let isQueryRunnerConnected = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const tableNamesWithColumn = await this.findTableNamesWithColumn({
        queryRunner,
        schemaName,
      });
      const legacyPrivateObjectMetadataIds =
        await this.findLegacyPrivateObjectMetadataIds({
          queryRunner,
          workspaceId,
        });
      const restrictableObjects = Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(isRestrictableObject)
        .filter(({ id }) => !legacyPrivateObjectMetadataIds.has(id))
        .filter((flatObjectMetadata) =>
          tableNamesWithColumn.has(
            getWorkspaceSchemaContextForMigration({
              workspaceId,
              objectMetadata: flatObjectMetadata,
            }).tableName,
          ),
        );

      if (options.dryRun) {
        await this.logDryRun({
          queryRunner,
          schemaName,
          workspaceId,
          objectMetadataIds: restrictableObjects.map(({ id }) => id),
        });

        return;
      }

      for (const flatObjectMetadata of restrictableObjects) {
        await this.makeRestrictedRecordsPrivate({
          queryRunner,
          schemaName,
          tableName: getWorkspaceSchemaContextForMigration({
            workspaceId,
            objectMetadata: flatObjectMetadata,
          }).tableName,
          objectMetadataId: flatObjectMetadata.id,
        });
      }

      await queryRunner.query(
        `INSERT INTO core."featureFlag" ("workspaceId", key, value)
           VALUES ($1, $2, true)
           ON CONFLICT ("workspaceId", key) DO UPDATE SET value = true`,
        [workspaceId, FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED],
      );
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'featureFlagsMap',
    ]);
  }

  private async findTableNamesWithColumn({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<Set<string>> {
    const columns: { tableName: string }[] = await queryRunner.query(
      `SELECT table_name AS "tableName" FROM information_schema.columns
         WHERE table_schema = $1 AND column_name = $2`,
      [schemaName, IS_PRIVATE_COLUMN_NAME],
    );

    return new Set(columns.map(({ tableName }) => tableName));
  }

  private async findLegacyPrivateObjectMetadataIds({
    queryRunner,
    workspaceId,
  }: {
    queryRunner: QueryRunner;
    workspaceId: string;
  }): Promise<Set<string>> {
    const objects: { id: string }[] = await queryRunner.query(
      `SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND readability = 'PRIVATE'`,
      [workspaceId],
    );

    return new Set(objects.map(({ id }) => id));
  }

  private async logDryRun({
    queryRunner,
    schemaName,
    workspaceId,
    objectMetadataIds,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    workspaceId: string;
    objectMetadataIds: string[];
  }): Promise<void> {
    const counts: { accessLevel: 'NONE' | 'READ'; count: string }[] =
      await queryRunner.query(
        `SELECT "accessLevel", COUNT(*) AS count FROM ${escapeIdentifier(schemaName)}."recordShare"
           WHERE "objectMetadataId" = ANY($1::uuid[]) AND "principalType" = 'EVERYONE'
             AND "rowCause" = 'MANUAL' AND "accessLevel" IN ('NONE', 'READ') AND "deletedAt" IS NULL
           GROUP BY "accessLevel"`,
        [objectMetadataIds],
      );
    const countByAccessLevel = new Map(
      counts.map(({ accessLevel, count }) => [accessLevel, Number(count)]),
    );

    this.logger.log(
      `[DRY RUN] Would make ${countByAccessLevel.get('NONE') ?? 0} record(s) private and return ${countByAccessLevel.get('READ') ?? 0} view-only record(s) to their roles for workspace ${workspaceId}`,
    );
  }

  private async makeRestrictedRecordsPrivate({
    queryRunner,
    schemaName,
    tableName,
    objectMetadataId,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    objectMetadataId: string;
  }): Promise<void> {
    const recordShareTable = `${escapeIdentifier(schemaName)}."recordShare"`;

    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `UPDATE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}
           SET ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} = true
           WHERE id IN (
             SELECT "recordId" FROM ${recordShareTable}
             WHERE "objectMetadataId" = $1 AND "principalType" = 'EVERYONE'
               AND "rowCause" = 'MANUAL' AND "accessLevel" = 'NONE' AND "deletedAt" IS NULL
           )`,
        [objectMetadataId],
      );
      await queryRunner.query(
        `DELETE FROM ${recordShareTable}
           WHERE "objectMetadataId" = $1 AND "principalType" = 'EVERYONE'
             AND "rowCause" = 'MANUAL' AND "accessLevel" IN ('NONE', 'READ')`,
        [objectMetadataId],
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    }
  }
}
