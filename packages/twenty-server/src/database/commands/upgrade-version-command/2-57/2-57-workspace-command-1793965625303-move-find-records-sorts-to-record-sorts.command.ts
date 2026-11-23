import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  moveFindRecordsSortsToRecordSorts,
  type SortableField,
} from 'src/database/commands/upgrade-version-command/2-57/utils/move-find-records-sorts-to-record-sorts.util';
import {
  rewriteJsonbRowsWithCompareAndSet,
  type StoredJsonbRow,
} from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// FAILED runs can be retried from their saved steps; other ended runs never execute again
const RUN_STATUSES_THAT_CAN_EXECUTE_STEPS = [
  'NOT_STARTED',
  'ENQUEUED',
  'RUNNING',
  'FAILED',
];

const RUN_PAGE_SIZE = 500;

const FIND_RECORDS_ORDER_BY_STEPS_CLAUSE = `(steps::text LIKE '%gqlOperationOrderBy%' OR steps::text LIKE '%recordSorts%')`;

type RewriteStoredStepsArgs = {
  dataSource: DataSource;
  isDryRun: boolean;
  tableName: string;
  mapRow: (row: StoredJsonbRow<unknown>) => {
    value: unknown;
    hasChanged: boolean;
  };
};

@RegisteredWorkspaceCommand('2.57.0', 1793965625303)
@Command({
  name: 'upgrade:2-57:move-find-records-sorts-to-record-sorts',
  description:
    'Store find records sorts only as record sorts, converting sorts written through the API as a GraphQL order, since runs now compute the order from them',
})
export class MoveFindRecordsSortsToRecordSortsCommand extends ProvisionedWorkspaceCommandRunner {
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
        `No data source for workspace ${workspaceId}, skipping find records sort conversion`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    const fieldsByObjectName = await this.getFieldsByObjectName(workspaceId);
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const workspaceVersionTable = `"${schemaName}"."workflowVersion"`;
    const workspaceRunTable = `"${schemaName}"."workflowRun"`;

    const convertSteps = ({
      value,
    }: Pick<StoredJsonbRow<unknown>, 'value'>) => {
      const converted = moveFindRecordsSortsToRecordSorts({
        steps: value,
        fieldsByObjectName,
      });

      for (const {
        stepId,
        orderByEntry,
      } of converted.inexactlyConvertedSorts) {
        this.logger.warn(
          `Workspace ${workspaceId}: find records step ${stepId} sort ${JSON.stringify(orderByEntry)} has no exact record sort; it is dropped if nested or unknown, nulls first becomes nulls last and a relation id sorts by the relation's label`,
        );
      }

      return { value: converted.steps, hasChanged: converted.hasChanged };
    };

    const coreVersionCount = await rewriteJsonbRowsWithCompareAndSet({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND ${FIND_RECORDS_ORDER_BY_STEPS_CLAUSE}`,
      whereParameters: [workspaceId],
      mapRow: convertSteps,
    });
    const workspaceVersionCount = await this.rewriteWorkspaceVersionSteps({
      dataSource,
      isDryRun,
      tableName: workspaceVersionTable,
      mapRow: convertSteps,
    });
    const runCount = await this.rewriteRunFlowSteps({
      dataSource,
      isDryRun,
      tableName: workspaceRunTable,
      mapRow: convertSteps,
    });

    // refreshed even when nothing is left, so a rerun after an interrupted run still clears stale versions
    if (!isDryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }

    if (coreVersionCount + workspaceVersionCount + runCount === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Moved find records sorts to record sorts in ${coreVersionCount} core version(s), ${workspaceVersionCount} workspace version(s) and ${runCount} pending run(s) for workspace ${workspaceId}`,
    );
  }

  private async getFieldsByObjectName(
    workspaceId: string,
  ): Promise<Map<string, SortableField[]>> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const fieldsByObjectName = new Map<string, SortableField[]>();

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      fieldsByObjectName.set(
        flatObjectMetadata.nameSingular,
        findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatObjectMetadata.fieldIds,
          flatEntityMaps: flatFieldMetadataMaps,
        }).map(({ id, name, type, relationTargetObjectMetadataId }) => ({
          id,
          name,
          type,
          relationTargetLabelFieldName: isDefined(
            relationTargetObjectMetadataId,
          )
            ? this.findLabelFieldName({
                objectMetadataId: relationTargetObjectMetadataId,
                flatObjectMetadataMaps,
                flatFieldMetadataMaps,
              })
            : undefined,
        })),
      );
    }

    return fieldsByObjectName;
  }

  private findLabelFieldName({
    objectMetadataId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    objectMetadataId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): string | undefined {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return undefined;
    }

    // an object without a label identifier is labelled by its name field, as the run sorts it
    if (!isDefined(flatObjectMetadata.labelIdentifierFieldMetadataId)) {
      return 'name';
    }

    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatObjectMetadata.labelIdentifierFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    })?.name;
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

  // Sets only the flow snapshot, and only if it is still the one read, so state the worker writes meanwhile is kept
  private async rewriteWorkspaceVersionSteps({
    dataSource,
    isDryRun,
    tableName,
    mapRow,
  }: RewriteStoredStepsArgs): Promise<number> {
    if (!(await this.tableExists({ dataSource, tableName }))) {
      return 0;
    }

    return rewriteJsonbRowsWithCompareAndSet({
      dataSource,
      isDryRun,
      tableName,
      columnName: 'steps',
      whereClause: FIND_RECORDS_ORDER_BY_STEPS_CLAUSE,
      whereParameters: [],
      mapRow,
    });
  }

  private async rewriteRunFlowSteps({
    dataSource,
    isDryRun,
    tableName,
    mapRow,
  }: RewriteStoredStepsArgs): Promise<number> {
    if (!(await this.tableExists({ dataSource, tableName }))) {
      return 0;
    }

    let rewrittenRunCount = 0;
    let lastRunId: string | undefined;

    while (true) {
      const rows: StoredJsonbRow<unknown>[] = await dataSource.query(
        `SELECT id, state->'flow'->'steps' AS value FROM ${tableName} WHERE status::text = ANY($1) AND (state->'flow'->'steps')::text LIKE '%gqlOperationOrderBy%' AND ($2::uuid IS NULL OR id > $2::uuid) ORDER BY id LIMIT $3`,
        [RUN_STATUSES_THAT_CAN_EXECUTE_STEPS, lastRunId ?? null, RUN_PAGE_SIZE],
      );

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

      if (rows.length < RUN_PAGE_SIZE) {
        break;
      }

      lastRunId = String(rows[rows.length - 1].id);
    }

    return rewrittenRunCount;
  }
}
