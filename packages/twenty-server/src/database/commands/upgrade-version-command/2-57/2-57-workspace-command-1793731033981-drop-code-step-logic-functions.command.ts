import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  rewriteJsonbRowsWithCompareAndSet,
  type StoredJsonbRow,
} from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';
import { dropInlinedCodeStepLogicFunctionIds } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-inlined-code-step-logic-function-ids.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const IN_FLIGHT_WORKFLOW_RUN_STATUSES = [
  'NOT_STARTED',
  'ENQUEUED',
  'RUNNING',
  'STOPPING',
];

type StepSource = {
  tableName: string;
  stepsExpression: string;
  whereClause: string;
  whereParameters: unknown[];
};

type StepLogicFunctionReference = {
  logicFunctionId: string;
  isInlinedCodeStep: boolean;
};

// contract of upgrade:2-56:inline-code-step-sources, which copied each legacy CODE step's source into the step
@RegisteredWorkspaceCommand('2.57.0', 1793731033981)
@Command({
  name: 'upgrade:2-57:drop-code-step-logic-functions',
  description:
    'Drop the logic function reference of workflow CODE steps that carry their code, then delete the functions nothing references anymore',
})
export class DropCodeStepLogicFunctionsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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
        `No data source for workspace ${workspaceId}, skipping code step logic functions`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    const workflowVersionSources: StepSource[] = [
      {
        tableName: 'core."workflowVersion"',
        stepsExpression: 'steps',
        whereClause: '"workspaceId" = $1',
        whereParameters: [workspaceId],
      },
    ];

    if (
      await this.hasWorkspaceTable({
        dataSource,
        workspaceId,
        objectUniversalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        tableName: `${schemaName}."workflowVersion"`,
      })
    ) {
      workflowVersionSources.push({
        tableName: `${schemaName}."workflowVersion"`,
        stepsExpression: 'steps',
        whereClause: 'true',
        whereParameters: [],
      });
    }

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    const existingLogicFunctionIds = new Set(
      Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(({ deletedAt }) => !isDefined(deletedAt))
        .map(({ id }) => id),
    );

    const droppedLogicFunctionIds = new Set<string>();
    const rewrittenRowCounts: number[] = [];

    for (const source of workflowVersionSources) {
      rewrittenRowCounts.push(
        await rewriteJsonbRowsWithCompareAndSet({
          dataSource,
          isDryRun,
          tableName: source.tableName,
          columnName: 'steps',
          whereClause: `${source.whereClause} AND steps @> '[{"type":"CODE"}]'`,
          whereParameters: source.whereParameters,
          mapRow: ({ id, value }: StoredJsonbRow<StoredWorkflowStep[]>) => {
            const {
              steps,
              droppedReferences,
              stubbedReferences,
              codelessReferences,
            } = dropInlinedCodeStepLogicFunctionIds({
              steps: value,
              existingLogicFunctionIds,
            });

            droppedReferences.forEach(({ logicFunctionId }) =>
              droppedLogicFunctionIds.add(logicFunctionId),
            );

            for (const { stepId, logicFunctionId } of codelessReferences) {
              this.logger.warn(
                `Workspace ${workspaceId}: code step ${String(stepId)} in ${source.tableName} ${id} has no code, it keeps running from function ${logicFunctionId}`,
              );
            }

            for (const { stepId, logicFunctionId } of stubbedReferences) {
              this.logger.warn(
                `Workspace ${workspaceId}: code step ${String(stepId)} in ${source.tableName} ${id} has no code and function ${logicFunctionId} is gone, replaced with code that throws`,
              );
            }

            return {
              value: steps,
              hasChanged:
                droppedReferences.length > 0 || stubbedReferences.length > 0,
            };
          },
        }),
      );
    }

    const [coreWorkflowVersionCount, workflowVersionCount = 0] =
      rewrittenRowCounts;

    if (!isDryRun && coreWorkflowVersionCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }

    const flatLogicFunctionsToDelete = await this.findFlatLogicFunctionsToDelete(
      {
        dataSource,
        workspaceId,
        schemaName,
        workflowVersionSources,
        droppedLogicFunctionIds,
        isDryRun,
      },
    );

    const deletedLogicFunctionCount = isDryRun
      ? flatLogicFunctionsToDelete.length
      : await this.deleteLogicFunctions({
          dataSource,
          workspaceId,
          flatLogicFunctionsToDelete,
        });

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: dropped the code step functions of ${coreWorkflowVersionCount} core workflow version(s) and ${workflowVersionCount} workflow version(s), and deleted ${deletedLogicFunctionCount} code step function(s)`,
    );
  }

  private async findFlatLogicFunctionsToDelete({
    dataSource,
    workspaceId,
    schemaName,
    workflowVersionSources,
    droppedLogicFunctionIds,
    isDryRun,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    schemaName: string;
    workflowVersionSources: StepSource[];
    droppedLogicFunctionIds: Set<string>;
    isDryRun: boolean;
  }): Promise<FlatLogicFunction[]> {
    if (droppedLogicFunctionIds.size === 0) {
      return [];
    }

    const referencedLogicFunctionIds = await this.findReferencedLogicFunctionIds(
      { dataSource, workspaceId, schemaName, workflowVersionSources, isDryRun },
    );

    const workspaceCustomApplicationId =
      await this.findWorkspaceCustomApplicationId({ dataSource, workspaceId });

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    // other applications own the functions they declare, only the custom application's are code step functions
    return Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        ({ id, deletedAt, applicationId }) =>
          !isDefined(deletedAt) &&
          droppedLogicFunctionIds.has(id) &&
          !referencedLogicFunctionIds.has(id) &&
          applicationId === workspaceCustomApplicationId,
      )
      .filter(hasNoTriggerOutsideWorkflows);
  }

  // a dry run did not rewrite the versions, so the inlined steps it would rewrite are not counted as references
  private async findReferencedLogicFunctionIds({
    dataSource,
    workspaceId,
    schemaName,
    workflowVersionSources,
    isDryRun,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    schemaName: string;
    workflowVersionSources: StepSource[];
    isDryRun: boolean;
  }): Promise<Set<string>> {
    const versionReferences = (
      await this.findReferences({
        dataSource,
        sources: workflowVersionSources,
      })
    ).filter(({ isInlinedCodeStep }) => !isDryRun || !isInlinedCodeStep);

    const hasWorkflowRunTable = await this.hasWorkspaceTable({
      dataSource,
      workspaceId,
      objectUniversalIdentifier:
        STANDARD_OBJECTS.workflowRun.universalIdentifier,
      tableName: `${schemaName}."workflowRun"`,
    });

    const inFlightRunReferences = hasWorkflowRunTable
      ? await this.findReferences({
          dataSource,
          sources: [
            {
              tableName: `${schemaName}."workflowRun"`,
              stepsExpression: `state->'flow'->'steps'`,
              whereClause: 'status::text = ANY($1::text[])',
              whereParameters: [IN_FLIGHT_WORKFLOW_RUN_STATUSES],
            },
          ],
        })
      : [];

    return new Set(
      [...versionReferences, ...inFlightRunReferences].map(
        ({ logicFunctionId }) => logicFunctionId,
      ),
    );
  }

  private async findReferences({
    dataSource,
    sources,
  }: {
    dataSource: DataSource;
    sources: StepSource[];
  }): Promise<StepLogicFunctionReference[]> {
    const references: StepLogicFunctionReference[] = [];

    for (const {
      tableName,
      stepsExpression,
      whereClause,
      whereParameters,
    } of sources) {
      const rows: StepLogicFunctionReference[] = await dataSource.query(
        `SELECT DISTINCT
           step->'settings'->'input'->>'logicFunctionId' AS "logicFunctionId",
           (step->>'type' = 'CODE'
             AND jsonb_typeof(step->'settings'->'input'->'code') = 'string'
             AND step->'settings'->'input'->>'code' <> '') AS "isInlinedCodeStep"
         FROM ${tableName}
         CROSS JOIN LATERAL jsonb_array_elements(
           CASE WHEN jsonb_typeof(${stepsExpression}) = 'array' THEN ${stepsExpression} ELSE '[]'::jsonb END
         ) AS step
         WHERE (${whereClause})
           AND jsonb_typeof(step->'settings'->'input'->'logicFunctionId') = 'string'`,
        whereParameters,
      );

      references.push(...rows);
    }

    return references;
  }

  private async findWorkspaceCustomApplicationId({
    dataSource,
    workspaceId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
  }): Promise<string | null> {
    const [{ workspaceCustomApplicationId }]: {
      workspaceCustomApplicationId: string | null;
    }[] = await dataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
      [workspaceId],
    );

    return workspaceCustomApplicationId;
  }

  private async deleteLogicFunctions({
    dataSource,
    workspaceId,
    flatLogicFunctionsToDelete,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    flatLogicFunctionsToDelete: FlatLogicFunction[];
  }): Promise<number> {
    if (flatLogicFunctionsToDelete.length === 0) {
      return 0;
    }

    const workspaceCustomFlatApplication =
      await this.findWorkspaceCustomFlatApplication({
        dataSource,
        workspaceId,
      });

    if (!isDefined(workspaceCustomFlatApplication)) {
      return 0;
    }

    // the migration runner also deletes the functions' files and executors
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatLogicFunctionsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    // the steps no longer reference them, so a function that cannot be deleted is only left over
    if (result.status === 'fail') {
      this.logger.error(
        `Workspace ${workspaceId}: could not delete ${flatLogicFunctionsToDelete.length} code step function(s): ${JSON.stringify(result)}`,
      );

      return 0;
    }

    return flatLogicFunctionsToDelete.length;
  }

  private async findWorkspaceCustomFlatApplication({
    dataSource,
    workspaceId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
  }): Promise<FlatApplication | undefined> {
    const workspaceCustomApplicationId =
      await this.findWorkspaceCustomApplicationId({ dataSource, workspaceId });

    if (!isDefined(workspaceCustomApplicationId)) {
      return undefined;
    }

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    return flatApplicationMaps.byId[workspaceCustomApplicationId];
  }

  private async hasWorkspaceTable({
    dataSource,
    workspaceId,
    objectUniversalIdentifier,
    tableName,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    objectUniversalIdentifier: string;
    tableName: string;
  }): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    if (
      !isDefined(
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: objectUniversalIdentifier,
        }),
      )
    ) {
      return false;
    }

    const [table]: { name: string | null }[] = await dataSource.query(
      'SELECT to_regclass($1) AS name',
      [tableName],
    );

    return isDefined(table?.name);
  }
}

const hasNoTriggerOutsideWorkflows = (flatLogicFunction: FlatLogicFunction) =>
  !isDefined(flatLogicFunction.cronTriggerSettings) &&
  !isDefined(flatLogicFunction.databaseEventTriggerSettings) &&
  !isDefined(flatLogicFunction.httpRouteTriggerSettings) &&
  !isDefined(flatLogicFunction.serverRouteTriggerSettings) &&
  !isDefined(flatLogicFunction.toolTriggerSettings) &&
  !isDefined(flatLogicFunction.workflowActionTriggerSettings);
