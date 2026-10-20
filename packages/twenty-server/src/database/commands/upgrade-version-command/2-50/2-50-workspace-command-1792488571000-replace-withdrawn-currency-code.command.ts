import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  REPLACEMENT_CURRENCY_CODE,
  WITHDRAWN_CURRENCY_CODE,
  replaceWithdrawnCurrencyCodeInChartConfiguration,
  replaceWithdrawnCurrencyCodeInDefaultValue,
  replaceWithdrawnCurrencyCodeInFindRecordsSteps,
  replaceWithdrawnCurrencyCodeInFilterValue,
} from 'src/database/commands/upgrade-version-command/2-50/utils/replace-withdrawn-currency-code.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

const REWRITE_BATCH_SIZE = 100;

type StoredJsonbRow = { id: string; value: unknown };

type RewriteRowsArgs<TRow extends StoredJsonbRow> = {
  dataSource: DataSource;
  isDryRun: boolean;
  tableName: string;
  columnName: string;
  whereClause: string;
  whereParameters: unknown[];
  mapRow: (row: TRow) => { value: unknown; hasChanged: boolean };
};

@RegisteredWorkspaceCommand('2.50.0', 1792488571000)
@Command({
  name: 'upgrade:2-50:replace-withdrawn-currency-code',
  description: `Replace the withdrawn ${WITHDRAWN_CURRENCY_CODE} currency code with ${REPLACEMENT_CURRENCY_CODE} in currency records, field default values, view filters, row level permission predicates, chart widgets and workflow Find Records steps`,
})
export class ReplaceWithdrawnCurrencyCodeCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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

    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const currencyFlatFieldMetadatas = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((field) => field.type === FieldMetadataType.CURRENCY);

    if (currencyFlatFieldMetadatas.length === 0) {
      return;
    }

    const currencyFieldMetadataIds = new Set(
      currencyFlatFieldMetadatas.map((field) => field.id),
    );

    const fieldDefaultValueCount = await this.replaceInFieldDefaultValues({
      workspaceId,
      isDryRun,
      currencyFlatFieldMetadatas,
    });

    const recordCount = await this.replaceInRecords({
      dataSource,
      isDryRun,
      workspaceId,
      currencyFlatFieldMetadatas,
      flatObjectMetadataMaps,
    });

    const mapStoredRecordFilterRow = ({ value }: StoredJsonbRow) =>
      replaceWithdrawnCurrencyCodeInFilterValue(value);

    const recordFilterWhereClause = `"workspaceId" = $1 AND "fieldMetadataId" = ANY($2::uuid[]) AND "subFieldName" = 'currencyCode' AND jsonb_typeof(value) = 'string'`;
    const recordFilterWhereParameters = [
      workspaceId,
      [...currencyFieldMetadataIds],
    ];

    const viewFilterCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."viewFilter"',
      columnName: 'value',
      whereClause: recordFilterWhereClause,
      whereParameters: recordFilterWhereParameters,
      mapRow: mapStoredRecordFilterRow,
    });

    const rowLevelPermissionPredicateCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."rowLevelPermissionPredicate"',
      columnName: 'value',
      whereClause: recordFilterWhereClause,
      whereParameters: recordFilterWhereParameters,
      mapRow: mapStoredRecordFilterRow,
    });

    const chartWidgetCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."pageLayoutWidget"',
      columnName: 'configuration',
      whereClause: `"workspaceId" = $1 AND configuration -> 'filter' -> 'recordFilters' IS NOT NULL`,
      whereParameters: [workspaceId],
      mapRow: ({ value }) =>
        replaceWithdrawnCurrencyCodeInChartConfiguration({
          configuration: value,
          currencyFieldMetadataIds,
        }),
    });

    const mapWorkflowVersionStepsRow = ({ value }: StoredJsonbRow) =>
      replaceWithdrawnCurrencyCodeInFindRecordsSteps({
        steps: value,
        currencyFieldMetadataIds,
      });

    const coreWorkflowVersionCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND steps @> '[{"type":"FIND_RECORDS"}]'`,
      whereParameters: [workspaceId],
      mapRow: mapWorkflowVersionStepsRow,
    });

    const workflowVersionFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });

    const workspaceWorkflowVersionCount = isDefined(
      workflowVersionFlatObjectMetadata,
    )
      ? await this.rewriteRows({
          dataSource,
          isDryRun,
          tableName: `"${getWorkspaceSchemaName(workspaceId)}"."workflowVersion"`,
          columnName: 'steps',
          whereClause: `steps @> '[{"type":"FIND_RECORDS"}]'`,
          whereParameters: [],
          mapRow: mapWorkflowVersionStepsRow,
        })
      : 0;

    if (
      !isDryRun &&
      viewFilterCount +
        rowLevelPermissionPredicateCount +
        chartWidgetCount +
        coreWorkflowVersionCount >
        0
    ) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatViewFilterMaps',
        'flatRowLevelPermissionPredicateMaps',
        'flatPageLayoutWidgetMaps',
        'flatWorkflowVersionMaps',
      ]);
    }

    if (
      fieldDefaultValueCount +
        recordCount +
        viewFilterCount +
        rowLevelPermissionPredicateCount +
        chartWidgetCount +
        coreWorkflowVersionCount +
        workspaceWorkflowVersionCount >
      0
    ) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Replaced ${WITHDRAWN_CURRENCY_CODE} with ${REPLACEMENT_CURRENCY_CODE} in workspace ${workspaceId}: ${fieldDefaultValueCount} field default value(s), ${recordCount} record(s), ${viewFilterCount} view filter(s), ${rowLevelPermissionPredicateCount} row level permission predicate(s), ${chartWidgetCount} chart widget(s), ${coreWorkflowVersionCount} core workflow version(s), ${workspaceWorkflowVersionCount} workflow version(s)`,
      );
    }
  }

  private async replaceInFieldDefaultValues({
    workspaceId,
    isDryRun,
    currencyFlatFieldMetadatas,
  }: {
    workspaceId: string;
    isDryRun: boolean;
    currencyFlatFieldMetadatas: FlatFieldMetadata[];
  }): Promise<number> {
    const flatFieldMetadatasToUpdateByApplication = new Map<
      string,
      FlatFieldMetadata[]
    >();

    for (const field of currencyFlatFieldMetadatas) {
      const { value: defaultValue, hasChanged } =
        replaceWithdrawnCurrencyCodeInDefaultValue(field.defaultValue);

      if (!hasChanged) {
        continue;
      }

      const flatFieldMetadatasToUpdate =
        flatFieldMetadatasToUpdateByApplication.get(
          field.applicationUniversalIdentifier,
        ) ?? [];

      flatFieldMetadatasToUpdate.push({ ...field, defaultValue });
      flatFieldMetadatasToUpdateByApplication.set(
        field.applicationUniversalIdentifier,
        flatFieldMetadatasToUpdate,
      );
    }

    let updatedFieldCount = 0;

    for (const [
      applicationUniversalIdentifier,
      flatFieldMetadatasToUpdate,
    ] of flatFieldMetadatasToUpdateByApplication) {
      updatedFieldCount += flatFieldMetadatasToUpdate.length;

      if (isDryRun) {
        continue;
      }

      const migrationArgs = {
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: flatFieldMetadatasToUpdate,
          },
        },
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to replace ${WITHDRAWN_CURRENCY_CODE} currency field default values`,
        );
      }
    }

    return updatedFieldCount;
  }

  private async replaceInRecords({
    dataSource,
    isDryRun,
    workspaceId,
    currencyFlatFieldMetadatas,
    flatObjectMetadataMaps,
  }: {
    dataSource: DataSource;
    isDryRun: boolean;
    workspaceId: string;
    currencyFlatFieldMetadatas: FlatFieldMetadata[];
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): Promise<number> {
    const currencyCodeProperty = compositeTypeDefinitions
      .get(FieldMetadataType.CURRENCY)
      ?.properties.find((property) => property.name === 'currencyCode');

    if (!isDefined(currencyCodeProperty)) {
      return 0;
    }

    let recordCount = 0;

    for (const field of currencyFlatFieldMetadatas) {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          field.objectMetadataUniversalIdentifier
        ];

      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: flatObjectMetadata,
      });
      const qualifiedTableName = `"${schemaName}"."${tableName}"`;
      const columnName = computeCompositeColumnName(
        field,
        currencyCodeProperty,
      );

      if (isDryRun) {
        const [{ count }]: { count: string }[] = await dataSource.query(
          `SELECT COUNT(*) AS count FROM ${qualifiedTableName} WHERE "${columnName}" = $1`,
          [WITHDRAWN_CURRENCY_CODE],
        );

        recordCount += Number(count);

        continue;
      }

      const [, updatedRowCount]: [unknown, number] = await dataSource.query(
        `UPDATE ${qualifiedTableName} SET "${columnName}" = $1 WHERE "${columnName}" = $2`,
        [REPLACEMENT_CURRENCY_CODE, WITHDRAWN_CURRENCY_CODE],
      );

      recordCount += updatedRowCount;
    }

    return recordCount;
  }

  private async rewriteRows<TRow extends StoredJsonbRow>({
    dataSource,
    isDryRun,
    tableName,
    columnName,
    whereClause,
    whereParameters,
    mapRow,
  }: RewriteRowsArgs<TRow>): Promise<number> {
    let rewrittenRowCount = 0;
    let afterRowId: string | undefined;

    while (true) {
      const parameters = isDefined(afterRowId)
        ? [...whereParameters, afterRowId]
        : whereParameters;

      const rows: TRow[] = await dataSource.query(
        `SELECT id, ${columnName} AS value FROM ${tableName} WHERE (${whereClause})${isDefined(afterRowId) ? ` AND id > $${parameters.length}` : ''} ORDER BY id LIMIT ${REWRITE_BATCH_SIZE}`,
        parameters,
      );

      const rewrites = rows.flatMap((row) => {
        const { value, hasChanged } = mapRow(row);

        return hasChanged ? [{ id: row.id, from: row.value, to: value }] : [];
      });

      if (isDryRun) {
        rewrittenRowCount += rewrites.length;
      } else if (rewrites.length > 0) {
        // Compare-and-set so a row edited since it was read is left as is
        const [, updatedRowCount]: [unknown, number] = await dataSource.query(
          `UPDATE ${tableName} AS target SET ${columnName} = rewrite."to" FROM jsonb_to_recordset($1::jsonb) AS rewrite(id uuid, "from" jsonb, "to" jsonb) WHERE target.id = rewrite.id AND target.${columnName} = rewrite."from"`,
          [JSON.stringify(rewrites)],
        );

        rewrittenRowCount += updatedRowCount;
      }

      if (rows.length < REWRITE_BATCH_SIZE) {
        return rewrittenRowCount;
      }

      afterRowId = rows[rows.length - 1].id;
    }
  }
}
