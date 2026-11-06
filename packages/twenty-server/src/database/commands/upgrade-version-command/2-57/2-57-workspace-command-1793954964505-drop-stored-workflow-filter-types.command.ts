import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  rewriteJsonbRowsWithCompareAndSet,
  type StoredJsonbRow,
} from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import {
  dropStoredStepFilterTypesFromSteps,
  dropStoredStepFilterTypesFromTrigger,
  dropStoredStepFilterTypesFromTriggers,
  type StepFilterTypeChange,
} from 'src/database/commands/upgrade-version-command/2-57/utils/drop-stored-step-filter-types.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Runs that ended never evaluate their filters again, so their snapshot is left as it ran
const RUN_STATUSES_STILL_EXECUTING_STEPS = [
  'NOT_STARTED',
  'ENQUEUED',
  'RUNNING',
];

const HAS_STEP_FILTERS = `::text LIKE '%"stepFilterGroupId"%'`;

type DroppedJsonbValue = {
  value: unknown;
  hasChanged: boolean;
  typeChanges: StepFilterTypeChange[];
};

@RegisteredWorkspaceCommand('2.57.0', 1793954964505)
@Command({
  name: 'upgrade:2-57:drop-stored-workflow-filter-types',
  description:
    'Drop the type stored on workflow filter, if/else and database event trigger filters, since runs now compute it from the filtered field or variable',
})
export class DropStoredWorkflowFilterTypesCommand extends ProvisionedWorkspaceCommandRunner {
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
        `No data source for workspace ${workspaceId}, skipping workflow filter type drop`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    const fieldTypeById = await this.getFieldTypeById(workspaceId);
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const workspaceVersionTable = `"${schemaName}"."workflowVersion"`;
    const workspaceRunTable = `"${schemaName}"."workflowRun"`;

    const logTypeChanges = ({
      value,
      hasChanged,
      typeChanges,
    }: DroppedJsonbValue) => {
      for (const {
        stepId,
        stepFilterId,
        storedType,
        computedType,
      } of typeChanges) {
        this.logger.warn(
          `Workspace ${workspaceId}: filter ${String(stepFilterId)} of step ${stepId} stored type ${JSON.stringify(storedType)} but now compares as ${computedType}`,
        );
      }

      return { value, hasChanged };
    };

    const mapSteps = ({ value }: StoredJsonbRow<unknown>) =>
      logTypeChanges(
        dropStoredStepFilterTypesFromSteps({ steps: value, fieldTypeById }),
      );

    const coreStepsCount = await rewriteJsonbRowsWithCompareAndSet({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND steps${HAS_STEP_FILTERS}`,
      whereParameters: [workspaceId],
      mapRow: mapSteps,
    });
    const coreTriggersCount = await rewriteJsonbRowsWithCompareAndSet({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'triggers',
      whereClause: `"workspaceId" = $1 AND triggers${HAS_STEP_FILTERS}`,
      whereParameters: [workspaceId],
      mapRow: ({ value }) =>
        logTypeChanges(
          dropStoredStepFilterTypesFromTriggers({
            triggers: value,
            fieldTypeById,
          }),
        ),
    });

    const hasWorkspaceVersionTable = await this.tableExists({
      dataSource,
      tableName: workspaceVersionTable,
    });
    const workspaceStepsCount = hasWorkspaceVersionTable
      ? await rewriteJsonbRowsWithCompareAndSet({
          dataSource,
          isDryRun,
          tableName: workspaceVersionTable,
          columnName: 'steps',
          whereClause: `steps${HAS_STEP_FILTERS}`,
          whereParameters: [],
          mapRow: mapSteps,
        })
      : 0;
    const workspaceTriggerCount = hasWorkspaceVersionTable
      ? await rewriteJsonbRowsWithCompareAndSet({
          dataSource,
          isDryRun,
          tableName: workspaceVersionTable,
          columnName: 'trigger',
          whereClause: `trigger${HAS_STEP_FILTERS}`,
          whereParameters: [],
          mapRow: ({ value }) =>
            logTypeChanges(
              dropStoredStepFilterTypesFromTrigger({
                trigger: value,
                fieldTypeById,
              }),
            ),
        })
      : 0;
    const runCount = (await this.tableExists({
      dataSource,
      tableName: workspaceRunTable,
    }))
      ? await this.rewriteRunFlowSteps({
          dataSource,
          isDryRun,
          tableName: workspaceRunTable,
          mapRow: mapSteps,
        })
      : 0;

    const rewrittenCount =
      coreStepsCount +
      coreTriggersCount +
      workspaceStepsCount +
      workspaceTriggerCount +
      runCount;

    if (rewrittenCount === 0) {
      return;
    }

    if (!isDryRun && coreStepsCount + coreTriggersCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
        'workflowAutomatedTriggerMaps',
      ]);
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Dropped stored filter types from ${coreStepsCount + coreTriggersCount} core version column(s), ${workspaceStepsCount + workspaceTriggerCount} workspace version column(s) and ${runCount} pending run(s) for workspace ${workspaceId}`,
    );
  }

  private async getFieldTypeById(
    workspaceId: string,
  ): Promise<Map<string, string>> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return new Map(
      Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map(({ id, type }) => [id, type]),
    );
  }

  private async tableExists({
    dataSource,
    tableName,
  }: {
    dataSource: DataSource;
    tableName: string;
  }): Promise<boolean> {
    const [{ exists }] = await dataSource.query(
      `SELECT to_regclass($1) IS NOT NULL AS "exists"`,
      [tableName],
    );

    return exists;
  }

  // Sets only the flow steps, and only if they are still the ones read, so state the worker writes meanwhile is kept
  private async rewriteRunFlowSteps({
    dataSource,
    isDryRun,
    tableName,
    mapRow,
  }: {
    dataSource: DataSource;
    isDryRun: boolean;
    tableName: string;
    mapRow: (row: StoredJsonbRow<unknown>) => {
      value: unknown;
      hasChanged: boolean;
    };
  }): Promise<number> {
    const rows: StoredJsonbRow<unknown>[] = await dataSource.query(
      `SELECT id, state->'flow'->'steps' AS value FROM ${tableName} WHERE status::text = ANY($1) AND (state->'flow'->'steps')${HAS_STEP_FILTERS}`,
      [RUN_STATUSES_STILL_EXECUTING_STEPS],
    );

    let rewrittenRunCount = 0;

    for (const row of rows) {
      const { value, hasChanged } = mapRow(row);

      if (!hasChanged) {
        continue;
      }

      if (isDryRun) {
        rewrittenRunCount += 1;
        continue;
      }

      const [, updatedRowCount]: [unknown, number] = await dataSource.query(
        `UPDATE ${tableName} SET state = jsonb_set(state, '{flow,steps}', $1::jsonb) WHERE id = $2 AND state->'flow'->'steps' = $3::jsonb`,
        [JSON.stringify(value), row.id, JSON.stringify(row.value)],
      );

      rewrittenRunCount += updatedRowCount;
    }

    return rewrittenRunCount;
  }
}
