import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  PERMISSION_STORAGE_OBJECTS_TO_CONVERT,
  PERMISSION_TABLES_FEATURE_FLAG_KEY,
  STANDARD_OBJECT_ONLY_COLUMN_NAMES,
  STANDARD_OBJECT_ONLY_ENUM_SUFFIXES,
} from 'src/database/commands/upgrade-version-command/2-61/constants/permission-storage-objects-to-convert.constant';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@RegisteredWorkspaceCommand('2.61.0', 1795258335000)
@Command({
  name: 'upgrade:2-61:convert-permission-storage-objects-to-tables',
  description:
    'Turn the recordShare and accessGroup standard objects into permission tables, keeping their rows',
})
export class ConvertPermissionStorageObjectsToTablesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const objectsToConvert: { id: string; universalIdentifier: string }[] =
      await this.dataSource.query(
        `SELECT "id", "universalIdentifier" FROM core."objectMetadata"
         WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)`,
        [
          workspaceId,
          PERMISSION_STORAGE_OBJECTS_TO_CONVERT.map(
            ({ universalIdentifier }) => universalIdentifier,
          ),
        ],
      );

    if (!isNonEmptyArray(objectsToConvert)) {
      await this.deletePermissionTablesFeatureFlag({ workspaceId, options });

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would convert ${objectsToConvert.length} permission storage objects to tables for workspace ${workspaceId}`,
      );

      return;
    }

    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const tableNames = PERMISSION_STORAGE_OBJECTS_TO_CONVERT.filter(
      ({ universalIdentifier }) =>
        objectsToConvert.some(
          (objectToConvert) =>
            objectToConvert.universalIdentifier === universalIdentifier,
        ),
    ).map(({ tableName }) => tableName);

    // Deleting the object rows directly keeps their tables, which a metadata migration would drop with their rows
    await this.dataSource.transaction(async (entityManager) => {
      await entityManager.query(
        `DELETE FROM core."objectMetadata" WHERE "id" = ANY($1)`,
        [objectsToConvert.map(({ id }) => id)],
      );

      for (const tableName of tableNames) {
        await entityManager.query(
          `ALTER TABLE ${schema}.${escapeIdentifier(tableName)} ${STANDARD_OBJECT_ONLY_COLUMN_NAMES.map(
            (columnName) => `DROP COLUMN IF EXISTS ${escapeIdentifier(columnName)}`,
          ).join(', ')}`,
        );

        for (const enumSuffix of STANDARD_OBJECT_ONLY_ENUM_SUFFIXES) {
          await entityManager.query(
            `DROP TYPE IF EXISTS ${schema}.${escapeIdentifier(`${tableName}_${enumSuffix}`)}`,
          );
        }
      }

      await entityManager.query(
        `DELETE FROM core."featureFlag" WHERE "workspaceId" = $1 AND "key" = $2`,
        [workspaceId, PERMISSION_TABLES_FEATURE_FLAG_KEY],
      );
    });

    await this.workspaceCacheService.flush(workspaceId, [
      ...new Set(
        ['objectMetadata', ...getMetadataRelatedMetadataNames('objectMetadata')].map(
          getMetadataFlatEntityMapsKey,
        ),
      ),
      'featureFlagsMap',
      'rolesPermissions',
      'ORMEntityMetadatas',
      'graphQLResolverNameMap',
    ]);
    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    this.logger.log(
      `Converted ${tableNames.join(', ')} to permission tables for workspace ${workspaceId}`,
    );
  }

  private async deletePermissionTablesFeatureFlag({
    workspaceId,
    options,
  }: Pick<RunOnWorkspaceArgs, 'workspaceId' | 'options'>): Promise<void> {
    if (options.dryRun ?? false) {
      return;
    }

    await this.dataSource.query(
      `DELETE FROM core."featureFlag" WHERE "workspaceId" = $1 AND "key" = $2`,
      [workspaceId, PERMISSION_TABLES_FEATURE_FLAG_KEY],
    );
    await this.workspaceCacheService.flush(workspaceId, ['featureFlagsMap']);
  }
}
