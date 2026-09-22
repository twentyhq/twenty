import { Command } from 'nest-commander';
import { FieldMetadataType, emailsCompositeType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { normalizeEmailField } from 'src/database/commands/upgrade-version-command/2-42/utils/normalize-email-field.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@RegisteredWorkspaceCommand('2.42.0', 1790089846053)
@Command({
  name: 'upgrade:2-42:normalize-email-domains',
  description: 'Normalize stored EMAILS domains to Unicode and report unique collisions',
})
export class NormalizeEmailDomainsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const runner = dataSource.createQueryRunner('master');

    try {
      await runner.connect();

      for (const objectMetadata of Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )) {
        if (!isDefined(objectMetadata)) {
          continue;
        }

        const emailFields = getFlatFieldsFromFlatObjectMetadata(
          objectMetadata,
          flatFieldMetadataMaps,
        ).filter(
          (fieldMetadata) => fieldMetadata.type === FieldMetadataType.EMAILS,
        );

        if (emailFields.length === 0) {
          continue;
        }

        const tableName = computeObjectTargetTable(objectMetadata);
        const existingColumns = await runner.manager.query<
          { columnName: string }[]
        >(
          `SELECT attname AS "columnName"
FROM pg_attribute
WHERE attrelid = to_regclass($1)
  AND attnum > 0
  AND NOT attisdropped`,
          [`${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`],
        );

        if (existingColumns.length === 0) {
          continue;
        }

        const existingColumnNames = new Set(
          existingColumns.map(({ columnName }) => columnName),
        );

        for (const emailField of emailFields) {
          const primaryColumn = computeCompositeColumnName(
            emailField,
            emailsCompositeType.properties[0],
          );
          const additionalColumn = computeCompositeColumnName(
            emailField,
            emailsCompositeType.properties[1],
          );

          if (
            !existingColumnNames.has(primaryColumn) ||
            !existingColumnNames.has(additionalColumn)
          ) {
            continue;
          }

          const tableReference = `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`;
          const { rewriteCount, updateCount, collisionCount, collisions } =
            await normalizeEmailField({
              runner,
              tableReference,
              primaryColumn: escapeIdentifier(primaryColumn),
              additionalColumn: escapeIdentifier(additionalColumn),
              isUnique: emailField.isUnique,
              dryRun: options.dryRun ?? false,
            });

          if (rewriteCount === 0) {
            continue;
          }

          this.logger.log(
            `${options.dryRun ? '[DRY RUN] Would normalize' : 'Normalized'} ${updateCount} EMAILS value(s) in ${tableName}.${emailField.name} for workspace ${workspaceId}`,
          );

          if (collisionCount > 0) {
            this.logger.warn(
              `Left ${collisionCount} primary email(s) unchanged in ${tableName}.${emailField.name} for workspace ${workspaceId} because canonical Unicode would violate uniqueness; merge these records manually. Examples: ${collisions.map(({ id, primaryEmail }) => `${id}: ${primaryEmail}`).join(', ')}`,
            );
          }
        }
      }
    } finally {
      await runner.release();
    }
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // Unicode values remain valid email values for the previous release.
  }
}
