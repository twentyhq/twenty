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
} from 'src/database/commands/upgrade-version-command/2-47/utils/map-stored-record-filters.util';
import { restoreDerivedRecordFilterProperties } from 'src/database/commands/upgrade-version-command/2-47/utils/restore-derived-record-filter-properties.util';
import {
  stripDerivedChartRecordFilterProperties,
  stripDerivedFindRecordsRecordFilterProperties,
} from 'src/database/commands/upgrade-version-command/2-47/utils/strip-derived-record-filter-properties.util';
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

// Runs are history and keep their properties, except the ones the stricter
// Find Records schema would reject, which would hide the run state in the UI
const INVALID_FIND_RECORDS_RECORD_FILTER_JSON_PATH =
  '$.flow.steps[*] ? (@.type == "FIND_RECORDS").settings.input.filter.recordFilters[*] ? (!(exists(@.id)) || @.id.type() != "string" || @.id == "" || !(exists(@.value)) || @.value.type() != "string")';

// Type, label and display value are derived from field metadata when the
// filters are loaded, and stale copies of them broke the filter editors
@RegisteredWorkspaceCommand('2.47.0', 1791717636512)
@Command({
  name: 'upgrade:2-47:strip-derived-record-filter-properties',
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
    await this.rewriteStoredRecordFilters(args, {
      mapFindRecordsRecordFilter: stripDerivedFindRecordsRecordFilterProperties,
      mapChartRecordFilter: stripDerivedChartRecordFilterProperties,
      shouldRewriteInvalidWorkflowRuns: true,
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

    await this.rewriteStoredRecordFilters(args, {
      mapFindRecordsRecordFilter: restoreRecordFilter,
      mapChartRecordFilter: restoreRecordFilter,
      shouldRewriteInvalidWorkflowRuns: false,
    });
  }

  // Raw SQL because dropping properties nothing reads changes no metadata the
  // migration runner could diff, and it must not be blocked by widgets that
  // fail unrelated validation (e.g. a filter on a deleted field)
  private async rewriteStoredRecordFilters(
    { workspaceId, options, dataSource }: RunOnWorkspaceArgs,
    rewrite: RecordFilterRewrite,
  ): Promise<void> {
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
          selectQuery: `SELECT id, steps AS value FROM "${schemaName}"."workflowVersion" WHERE steps @> '[{"type":"FIND_RECORDS"}]'`,
          selectParameters: [],
          updateQuery: `UPDATE "${schemaName}"."workflowVersion" SET steps = $1::jsonb WHERE id = $2`,
          mapValue: (steps) =>
            mapFindRecordsStepRecordFilters(
              steps,
              rewrite.mapFindRecordsRecordFilter,
            ),
        })
      : 0;

    const workflowRunCount =
      hasWorkflowObjects && rewrite.shouldRewriteInvalidWorkflowRuns
        ? await this.rewriteRows({
            dataSource,
            isDryRun,
            selectQuery: `SELECT id, state AS value FROM "${schemaName}"."workflowRun" WHERE jsonb_path_exists(state, $1::jsonpath)`,
            selectParameters: [INVALID_FIND_RECORDS_RECORD_FILTER_JSON_PATH],
            updateQuery: `UPDATE "${schemaName}"."workflowRun" SET state = $1::jsonb WHERE id = $2`,
            mapValue: (state) => this.mapWorkflowRunState(state, rewrite),
          })
        : 0;

    const coreWorkflowVersionCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      selectQuery: `SELECT id, steps AS value FROM core."workflowVersion" WHERE "workspaceId" = $1 AND steps @> '[{"type":"FIND_RECORDS"}]'`,
      selectParameters: [workspaceId],
      updateQuery: `UPDATE core."workflowVersion" SET steps = $1::jsonb WHERE id = $2`,
      mapValue: (steps) =>
        mapFindRecordsStepRecordFilters(
          steps,
          rewrite.mapFindRecordsRecordFilter,
        ),
    });

    const chartWidgetCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      selectQuery: `SELECT id, configuration AS value FROM core."pageLayoutWidget" WHERE "workspaceId" = $1 AND configuration -> 'filter' IS NOT NULL`,
      selectParameters: [workspaceId],
      updateQuery: `UPDATE core."pageLayoutWidget" SET configuration = $1::jsonb WHERE id = $2`,
      mapValue: (configuration) =>
        mapChartWidgetRecordFilters(configuration, rewrite.mapChartRecordFilter),
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

  private mapWorkflowRunState(
    state: unknown,
    rewrite: RecordFilterRewrite,
  ): { value: unknown; hasChanged: boolean } {
    if (!isPlainObject(state) || !isPlainObject(state.flow)) {
      return { value: state, hasChanged: false };
    }

    const { value: steps, hasChanged } = mapFindRecordsStepRecordFilters(
      state.flow.steps,
      rewrite.mapFindRecordsRecordFilter,
    );

    return hasChanged
      ? { value: { ...state, flow: { ...state.flow, steps } }, hasChanged }
      : { value: state, hasChanged };
  }

  private async rewriteRows({
    dataSource,
    isDryRun,
    selectQuery,
    selectParameters,
    updateQuery,
    mapValue,
  }: {
    dataSource: DataSource;
    isDryRun: boolean;
    selectQuery: string;
    selectParameters: unknown[];
    updateQuery: string;
    mapValue: (value: unknown) => { value: unknown; hasChanged: boolean };
  }): Promise<number> {
    const rows: { id: string; value: unknown }[] = await dataSource.query(
      selectQuery,
      selectParameters,
    );

    let rewrittenCount = 0;

    for (const row of rows) {
      const { value, hasChanged } = mapValue(row.value);

      if (!hasChanged) {
        continue;
      }

      rewrittenCount += 1;

      if (!isDryRun) {
        await dataSource.query(updateQuery, [JSON.stringify(value), row.id]);
      }
    }

    return rewrittenCount;
  }
}
