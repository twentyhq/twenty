import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  mapChartWidgetRecordFilters,
  mapFindRecordsStepRecordFilters,
} from 'src/database/commands/upgrade-version-command/2-48/utils/map-stored-record-filters.util';
import { restoreDerivedRecordFilterProperties } from 'src/database/commands/upgrade-version-command/2-48/utils/restore-derived-record-filter-properties.util';
import {
  stripDerivedChartRecordFilterProperties,
  stripDerivedFindRecordsRecordFilterProperties,
} from 'src/database/commands/upgrade-version-command/2-48/utils/strip-derived-record-filter-properties.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type StoredRecordFilter = Record<string, unknown>;

type RecordFilterRewrite = {
  mapFindRecordsRecordFilter: (args: {
    recordFilter: StoredRecordFilter;
    index: number;
    stepId: string;
  }) => StoredRecordFilter;
  mapChartRecordFilter: (args: {
    recordFilter: StoredRecordFilter;
  }) => StoredRecordFilter;
  shouldRewriteInvalidWorkflowRuns: boolean;
};

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

const INVALID_FIND_RECORDS_RECORD_FILTER_JSON_PATH =
  '$.flow.steps[*] ? (@.type == "FIND_RECORDS").settings.input.filter.recordFilters[*] ? (!(exists(@.id)) || @.id.type() != "string" || @.id == "" || !(exists(@.value)) || @.value.type() != "string")';

@RegisteredWorkspaceCommand('2.48.0', 1792139106098)
@Command({
  name: 'upgrade:2-48:strip-derived-record-filter-properties',
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
      rewrite: {
        mapFindRecordsRecordFilter:
          stripDerivedFindRecordsRecordFilterProperties,
        mapChartRecordFilter: stripDerivedChartRecordFilterProperties,
        shouldRewriteInvalidWorkflowRuns: true,
      },
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(args.workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const restoreRecordFilter = ({
      recordFilter,
    }: {
      recordFilter: StoredRecordFilter;
    }) =>
      restoreDerivedRecordFilterProperties({
        recordFilter,
        flatFieldMetadataMaps,
      });

    await this.rewriteStoredRecordFilters({
      ...args,
      rewrite: {
        mapFindRecordsRecordFilter: restoreRecordFilter,
        mapChartRecordFilter: restoreRecordFilter,
        shouldRewriteInvalidWorkflowRuns: false,
      },
    });
  }

  private async rewriteStoredRecordFilters({
    workspaceId,
    options,
    dataSource,
    rewrite,
  }: RunOnWorkspaceArgs & { rewrite: RecordFilterRewrite }): Promise<void> {
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

    const hasWorkflowObjects = [
      STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      STANDARD_OBJECTS.workflowRun.universalIdentifier,
    ].every((universalIdentifier) =>
      isDefined(
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier,
        }),
      ),
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const workspaceWorkflowVersionCount = hasWorkflowObjects
      ? await this.rewriteRows({
          dataSource,
          isDryRun,
          tableName: `"${schemaName}"."workflowVersion"`,
          columnName: 'steps',
          whereClause: `steps @> '[{"type":"FIND_RECORDS"}]'`,
          whereParameters: [],
          mapValue: (steps) =>
            mapFindRecordsStepRecordFilters({
              steps,
              mapRecordFilter: rewrite.mapFindRecordsRecordFilter,
            }),
        })
      : 0;

    const workflowRunCount =
      hasWorkflowObjects && rewrite.shouldRewriteInvalidWorkflowRuns
        ? await this.rewriteRows({
            dataSource,
            isDryRun,
            tableName: `"${schemaName}"."workflowRun"`,
            columnName: 'state',
            whereClause: 'jsonb_path_exists(state, $1::jsonpath)',
            whereParameters: [INVALID_FIND_RECORDS_RECORD_FILTER_JSON_PATH],
            mapValue: (state) => this.mapWorkflowRunState({ state, rewrite }),
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
        mapFindRecordsStepRecordFilters({
          steps,
          mapRecordFilter: rewrite.mapFindRecordsRecordFilter,
        }),
    });

    const chartWidgetCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."pageLayoutWidget"',
      columnName: 'configuration',
      whereClause: `"workspaceId" = $1 AND configuration -> 'filter' IS NOT NULL`,
      whereParameters: [workspaceId],
      mapValue: (configuration) =>
        mapChartWidgetRecordFilters({
          configuration,
          mapRecordFilter: rewrite.mapChartRecordFilter,
        }),
    });

    if (!isDryRun && coreWorkflowVersionCount + chartWidgetCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
        'flatPageLayoutWidgetMaps',
      ]);
    }

    if (
      workspaceWorkflowVersionCount +
        workflowRunCount +
        coreWorkflowVersionCount +
        chartWidgetCount >
      0
    ) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Rewrote record filters in workspace ${workspaceId}: ${workspaceWorkflowVersionCount} workflow version(s), ${coreWorkflowVersionCount} core workflow version(s), ${workflowRunCount} workflow run(s), ${chartWidgetCount} chart widget(s)`,
      );
    }
  }

  private mapWorkflowRunState({
    state,
    rewrite,
  }: {
    state: unknown;
    rewrite: RecordFilterRewrite;
  }): { value: unknown; hasChanged: boolean } {
    if (!isPlainObject(state) || !isPlainObject(state.flow)) {
      return { value: state, hasChanged: false };
    }

    const { value: steps, hasChanged } = mapFindRecordsStepRecordFilters({
      steps: state.flow.steps,
      mapRecordFilter: rewrite.mapFindRecordsRecordFilter,
    });

    return hasChanged
      ? { value: { ...state, flow: { ...state.flow, steps } }, hasChanged }
      : { value: state, hasChanged };
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
