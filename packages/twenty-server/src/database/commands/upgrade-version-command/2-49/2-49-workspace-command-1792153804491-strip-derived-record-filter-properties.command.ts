import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  mapChartWidgetRecordFilters,
  mapFindRecordsStepRecordFilters,
  type MapStoredRecordFilter,
  mapWorkflowRunStateRecordFilters,
} from 'src/database/commands/upgrade-version-command/2-49/utils/map-stored-record-filters.util';
import { restoreDerivedRecordFilterProperties } from 'src/database/commands/upgrade-version-command/2-49/utils/restore-derived-record-filter-properties.util';
import { stripDerivedRecordFilterProperties } from 'src/database/commands/upgrade-version-command/2-49/utils/strip-derived-record-filter-properties.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const REWRITE_BATCH_SIZE = 100;

type RewriteRowsArgs = {
  dataSource: DataSource;
  isDryRun: boolean;
  tableName: string;
  columnName: string;
  whereClause: string;
  whereParameters: unknown[];
  mapValue: (value: unknown) => { value: unknown; hasChanged: boolean };
  afterRowId?: string;
};

const NON_STRING_FIND_RECORDS_RECORD_FILTER_VALUE_JSON_PATH =
  '$.flow.steps[*] ? (@.type == "FIND_RECORDS").settings.input.filter.recordFilters[*] ? (exists(@.value) && @.value.type() != "string" && @.value.type() != "null")';

@RegisteredWorkspaceCommand('2.49.0', 1792153804491)
@Command({
  name: 'upgrade:2-49:strip-derived-record-filter-properties',
  description:
    'Store the record filters of workflow Find Records steps and chart widgets as field references only, without the type, label and display value derived from field metadata',
})
export class StripDerivedRecordFilterPropertiesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.rewriteStoredRecordFilters({
      ...args,
      mapRecordFilter: stripDerivedRecordFilterProperties,
    });

    await this.rewriteWorkflowRunsWithNonStringRecordFilterValues(args);
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(args.workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    await this.rewriteStoredRecordFilters({
      ...args,
      mapRecordFilter: ({ recordFilter }) =>
        restoreDerivedRecordFilterProperties({
          recordFilter,
          flatFieldMetadataMaps,
        }),
    });
  }

  private async rewriteStoredRecordFilters({
    workspaceId,
    options,
    dataSource,
    mapRecordFilter,
  }: RunOnWorkspaceArgs & {
    mapRecordFilter: MapStoredRecordFilter;
  }): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping record filter rewrite`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const hasWorkspaceWorkflowVersionObject = isDefined(
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      }),
    );

    const workspaceWorkflowVersionCount = hasWorkspaceWorkflowVersionObject
      ? await this.rewriteRows({
          dataSource,
          isDryRun,
          tableName: `"${getWorkspaceSchemaName(workspaceId)}"."workflowVersion"`,
          columnName: 'steps',
          whereClause: `steps @> '[{"type":"FIND_RECORDS"}]'`,
          whereParameters: [],
          mapValue: (steps) =>
            mapFindRecordsStepRecordFilters({ steps, mapRecordFilter }),
        })
      : 0;

    const coreWorkflowVersionCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND steps @> '[{"type":"FIND_RECORDS"}]'`,
      whereParameters: [workspaceId],
      mapValue: (steps) =>
        mapFindRecordsStepRecordFilters({ steps, mapRecordFilter }),
    });

    const chartWidgetCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."pageLayoutWidget"',
      columnName: 'configuration',
      whereClause: `"workspaceId" = $1 AND configuration -> 'filter' IS NOT NULL`,
      whereParameters: [workspaceId],
      mapValue: (configuration) =>
        mapChartWidgetRecordFilters({ configuration, mapRecordFilter }),
    });

    if (!isDryRun && coreWorkflowVersionCount + chartWidgetCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
        'flatPageLayoutWidgetMaps',
      ]);
    }

    if (
      workspaceWorkflowVersionCount +
        coreWorkflowVersionCount +
        chartWidgetCount >
      0
    ) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Rewrote record filters in workspace ${workspaceId}: ${workspaceWorkflowVersionCount} workflow version(s), ${coreWorkflowVersionCount} core workflow version(s), ${chartWidgetCount} chart widget(s)`,
      );
    }
  }

  private async rewriteWorkflowRunsWithNonStringRecordFilterValues({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const hasWorkflowRunObject = isDefined(
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
      }),
    );

    if (!hasWorkflowRunObject) {
      return;
    }

    const isDryRun = options.dryRun ?? false;

    const workflowRunCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: `"${getWorkspaceSchemaName(workspaceId)}"."workflowRun"`,
      columnName: 'state',
      whereClause: 'jsonb_path_exists(state, $1::jsonpath)',
      whereParameters: [NON_STRING_FIND_RECORDS_RECORD_FILTER_VALUE_JSON_PATH],
      mapValue: (state) =>
        mapWorkflowRunStateRecordFilters({
          state,
          mapRecordFilter: stripDerivedRecordFilterProperties,
        }),
    });

    if (workflowRunCount > 0) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Rewrote ${workflowRunCount} workflow run(s) whose record filters held a non-string value in workspace ${workspaceId}`,
      );
    }
  }

  private async rewriteRows(
    rewriteRowsArgs: RewriteRowsArgs,
  ): Promise<number> {
    const {
      dataSource,
      isDryRun,
      tableName,
      columnName,
      whereClause,
      whereParameters,
      mapValue,
      afterRowId,
    } = rewriteRowsArgs;

    const candidateRows: { id: string; value: unknown }[] =
      await dataSource.query(
        `SELECT id, ${columnName} AS value FROM ${tableName} WHERE (${whereClause})${isDefined(afterRowId) ? ` AND id > $${whereParameters.length + 1}` : ''} ORDER BY id LIMIT ${REWRITE_BATCH_SIZE}`,
        isDefined(afterRowId)
          ? [...whereParameters, afterRowId]
          : whereParameters,
      );

    const rewrittenRowIds: string[] = [];

    for (const candidateRow of candidateRows) {
      if (!mapValue(candidateRow.value).hasChanged) {
        continue;
      }

      const hasRewritten =
        isDryRun ||
        (await this.rewriteRowUnderLock({
          dataSource,
          tableName,
          columnName,
          rowId: candidateRow.id,
          mapValue,
        }));

      if (hasRewritten) {
        rewrittenRowIds.push(candidateRow.id);
      }
    }

    if (candidateRows.length < REWRITE_BATCH_SIZE) {
      return rewrittenRowIds.length;
    }

    const nextPageRewrittenCount = await this.rewriteRows({
      ...rewriteRowsArgs,
      afterRowId: candidateRows[candidateRows.length - 1].id,
    });

    return rewrittenRowIds.length + nextPageRewrittenCount;
  }

  private async rewriteRowUnderLock({
    dataSource,
    tableName,
    columnName,
    rowId,
    mapValue,
  }: {
    dataSource: DataSource;
    tableName: string;
    columnName: string;
    rowId: string;
    mapValue: (value: unknown) => { value: unknown; hasChanged: boolean };
  }): Promise<boolean> {
    return dataSource.transaction(async (manager) => {
      const [lockedRow]: { value: unknown }[] = await manager.query(
        `SELECT ${columnName} AS value FROM ${tableName} WHERE id = $1 FOR UPDATE`,
        [rowId],
      );

      if (!isDefined(lockedRow)) {
        return false;
      }

      const { value, hasChanged } = mapValue(lockedRow.value);

      if (!hasChanged) {
        return false;
      }

      await manager.query(
        `UPDATE ${tableName} SET ${columnName} = $1::jsonb WHERE id = $2`,
        [JSON.stringify(value), rowId],
      );

      return true;
    });
  }
}
