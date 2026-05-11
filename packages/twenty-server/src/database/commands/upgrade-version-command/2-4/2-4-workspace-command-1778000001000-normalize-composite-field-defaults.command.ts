import { Command } from 'nest-commander';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { normalizeCompositeDefaultValue } from 'src/engine/metadata-modules/flat-field-metadata/utils/normalize-composite-default-value.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';

const hasEmptyStringSentinel = (defaultValue: unknown): boolean => {
  if (
    !isDefined(defaultValue) ||
    typeof defaultValue !== 'object' ||
    Array.isArray(defaultValue)
  ) {
    return false;
  }

  return Object.values(defaultValue as Record<string, unknown>).some(
    (value) =>
      typeof value === 'string' && (value === "''" || value === ''),
  );
};

@RegisteredWorkspaceCommand('2.4.0', 1778000001000)
@Command({
  name: 'upgrade:2-4:normalize-composite-field-defaults',
  description:
    'Normalize composite field default values: remove empty-string values from metadata and backfill workspace data with NULL.',
})
export class NormalizeCompositeFieldDefaultsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fieldMetadataService: FieldMetadataService,
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

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const affectedFields = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((field) => isCompositeFieldMetadataType(field.type))
      .filter((field) => field.defaultValue !== normalizeCompositeDefaultValue(field.defaultValue, field.type as CompositeFieldMetadataType));

    if (affectedFields.length === 0) {
      this.logger.log(
        `No composite fields with empty-string values found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would normalize ${affectedFields.length} composite field(s) for workspace ${workspaceId}: ${affectedFields.map((f) => f.name).join(', ')}`,
      );

      return;
    }


    const schemaName = getWorkspaceSchemaName(workspaceId);
    const backfillTargets: Array<{ tableName: string; columnName: string }> =
      [];

    for (const field of affectedFields) {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          field.objectMetadataUniversalIdentifier
        ];

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `Object metadata not found for field ${field.name} (${field.id}), skipping data backfill for this field`,
        );
        continue;
      }

      const tableName = computeObjectTargetTable(flatObjectMetadata);
      const compositeType = compositeTypeDefinitions.get(
        field.type as FieldMetadataType,
      );

      if (!isDefined(compositeType)) {
        continue;
      }

      for (const property of compositeType.properties) {
        if (property.type !== FieldMetadataType.TEXT) {
          continue;
        }

        backfillTargets.push({
          tableName,
          columnName: computeCompositeColumnName(field.name, property),
        });
      }
    }


    for (const field of affectedFields) {
      await this.fieldMetadataService.updateOneField({
        updateFieldInput: {
          id: field.id,
          defaultValue: normalizeCompositeDefaultValue(field.defaultValue, field.type as CompositeFieldMetadataType),
        },
        workspaceId,
        isSystemBuild: true,
      });

      this.logger.log(
        `Normalized defaultValue for composite field "${field.name}" (${field.id}) in workspace ${workspaceId}`,
      );
    }

    for (const { tableName, columnName } of backfillTargets) {
      await dataSource.query(
        `UPDATE "${schemaName}"."${tableName}"
         SET "${columnName}" = NULL
         WHERE "${columnName}" = ''`,
      );

      this.logger.log(
        `Backfilled NULL for "${schemaName}"."${tableName}"."${columnName}"`,
      );
    }
  }
}
