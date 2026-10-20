import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  wrapBareSelectRecordFilterValue,
  wrapBareSelectValuesOfChartConfiguration,
  wrapBareSelectValuesOfFindRecordsSteps,
} from 'src/database/commands/upgrade-version-command/2-50/utils/wrap-bare-select-filter-values.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const REWRITE_BATCH_SIZE = 100;

type StoredJsonbRow = { id: string; value: unknown };

type StoredRecordFilterRow = StoredJsonbRow & {
  fieldMetadataId: string;
  relationTargetFieldMetadataId?: string | null;
  operand: string;
  subFieldName: string | null;
};

type RewriteRowsArgs<TRow extends StoredJsonbRow> = {
  dataSource: DataSource;
  isDryRun: boolean;
  tableName: string;
  columnName: string;
  selectedColumns?: string;
  whereClause: string;
  whereParameters: unknown[];
  mapRow: (row: TRow) => {
    value: unknown;
    hasChanged: boolean;
  };
};

@RegisteredWorkspaceCommand('2.50.0', 1792423785749)
@Command({
  name: 'upgrade:2-50:wrap-bare-select-filter-values',
  description:
    'Store SELECT and MULTI_SELECT filter values of views, row level permission predicates, chart widgets and workflow Find Records steps as a stringified array of options, replacing a bare option value',
})
export class WrapBareSelectFilterValuesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping select filter value rewrite`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const mapStoredRecordFilterRow = ({
      value,
      ...recordFilter
    }: StoredRecordFilterRow) => {
      const mappedValue = wrapBareSelectRecordFilterValue({
        recordFilter: { ...recordFilter, value },
        flatFieldMetadataMaps,
      }).value;

      return { value: mappedValue, hasChanged: mappedValue !== value };
    };

    const viewFilterCount = await this.rewriteRows<StoredRecordFilterRow>({
      dataSource,
      isDryRun,
      tableName: 'core."viewFilter"',
      columnName: 'value',
      selectedColumns:
        '"fieldMetadataId", "relationTargetFieldMetadataId", operand, "subFieldName"',
      whereClause: `"workspaceId" = $1 AND jsonb_typeof(value) = 'string'`,
      whereParameters: [workspaceId],
      mapRow: mapStoredRecordFilterRow,
    });

    const rowLevelPermissionPredicateCount =
      await this.rewriteRows<StoredRecordFilterRow>({
        dataSource,
        isDryRun,
        tableName: 'core."rowLevelPermissionPredicate"',
        columnName: 'value',
        selectedColumns: '"fieldMetadataId", operand, "subFieldName"',
        whereClause: `"workspaceId" = $1 AND jsonb_typeof(value) = 'string' AND "workspaceMemberFieldMetadataId" IS NULL`,
        whereParameters: [workspaceId],
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
        wrapBareSelectValuesOfChartConfiguration({
          configuration: value,
          flatFieldMetadataMaps,
        }),
    });

    const coreWorkflowVersionCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND steps @> '[{"type":"FIND_RECORDS"}]'`,
      whereParameters: [workspaceId],
      mapRow: ({ value }) =>
        wrapBareSelectValuesOfFindRecordsSteps({
          steps: value,
          flatFieldMetadataMaps,
        }),
    });

    const workspaceWorkflowVersionCount =
      await this.rewriteWorkspaceWorkflowVersions({
        dataSource,
        isDryRun,
        workspaceId,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

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
      viewFilterCount +
        rowLevelPermissionPredicateCount +
        chartWidgetCount +
        coreWorkflowVersionCount +
        workspaceWorkflowVersionCount >
      0
    ) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Wrapped bare select filter values in workspace ${workspaceId}: ${viewFilterCount} view filter(s), ${rowLevelPermissionPredicateCount} row level permission predicate(s), ${chartWidgetCount} chart widget(s), ${coreWorkflowVersionCount} core workflow version(s), ${workspaceWorkflowVersionCount} workflow version(s)`,
      );
    }
  }

  private async rewriteWorkspaceWorkflowVersions({
    dataSource,
    isDryRun,
    workspaceId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    dataSource: DataSource;
    isDryRun: boolean;
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<number> {
    const workflowVersionFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });

    if (!isDefined(workflowVersionFlatObjectMetadata)) {
      return 0;
    }

    return this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: `"${getWorkspaceSchemaName(workspaceId)}"."workflowVersion"`,
      columnName: 'steps',
      whereClause: `steps @> '[{"type":"FIND_RECORDS"}]'`,
      whereParameters: [],
      mapRow: ({ value }) =>
        wrapBareSelectValuesOfFindRecordsSteps({
          steps: value,
          flatFieldMetadataMaps,
        }),
    });
  }

  private async rewriteRows<TRow extends StoredJsonbRow>({
    dataSource,
    isDryRun,
    tableName,
    columnName,
    selectedColumns,
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
        `SELECT id, ${columnName} AS value${isDefined(selectedColumns) ? `, ${selectedColumns}` : ''} FROM ${tableName} WHERE (${whereClause})${isDefined(afterRowId) ? ` AND id > $${parameters.length}` : ''} ORDER BY id LIMIT ${REWRITE_BATCH_SIZE}`,
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
