import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  inlineCodeStepSources,
  OVERSIZED_CODE_STEP_SOURCE,
} from 'src/database/commands/upgrade-version-command/2-56/utils/inline-code-step-sources.util';
import {
  rewriteJsonbRowsWithCompareAndSet,
  type StoredJsonbRow,
} from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

// the max length of settings.input.code in the CODE step schema
const CODE_STEP_SOURCE_MAX_LENGTH = 256_000;

const SOURCE_READ_BATCH_SIZE = 20;

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
  isLegacyCodeStep: boolean;
};

// in-flight runs still execute the legacy step by logicFunctionId, so their functions are kept
@RegisteredWorkspaceCommand('2.56.0', 1793717835616)
@Command({
  name: 'upgrade:2-56:inline-code-step-sources',
  description:
    'Move the source of the hidden logic function behind each workflow CODE step into the step, then delete the functions nothing references anymore',
})
export class InlineCodeStepSourcesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileStorageService: FileStorageService,
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
        `No data source for workspace ${workspaceId}, skipping code step sources`,
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

    const versionReferences = await this.findReferences({
      dataSource,
      sources: workflowVersionSources,
    });

    const legacyLogicFunctionIds = [
      ...new Set(
        versionReferences
          .filter(({ isLegacyCodeStep }) => isLegacyCodeStep)
          .map(({ logicFunctionId }) => logicFunctionId),
      ),
    ];

    if (legacyLogicFunctionIds.length === 0) {
      return;
    }

    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
      ]);

    const flatLogicFunctionById = new Map(
      Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(({ deletedAt }) => !isDefined(deletedAt))
        .map((flatLogicFunction) => [flatLogicFunction.id, flatLogicFunction]),
    );

    const flatLogicFunctionsToInline = legacyLogicFunctionIds
      .map((logicFunctionId) => flatLogicFunctionById.get(logicFunctionId))
      .filter(isDefined);

    const sourceByLogicFunctionId = await this.readSources({
      workspaceId,
      flatApplicationMaps,
      flatLogicFunctions: flatLogicFunctionsToInline,
    });

    const recoveredLogicFunctionIds = new Set(
      [...sourceByLogicFunctionId.entries()]
        .filter(([, source]) => source !== OVERSIZED_CODE_STEP_SOURCE)
        .map(([logicFunctionId]) => logicFunctionId),
    );

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
            const { steps, inlinedCodeSteps } = inlineCodeStepSources({
              steps: value,
              sourceByLogicFunctionId,
            });

            for (const { stepId, logicFunctionId } of inlinedCodeSteps) {
              if (!recoveredLogicFunctionIds.has(logicFunctionId)) {
                this.logger.warn(
                  `Workspace ${workspaceId}: the source of code step ${String(stepId)} in ${source.tableName} ${id} is ${sourceByLogicFunctionId.has(logicFunctionId) ? 'over the size limit' : 'missing'} (function ${logicFunctionId}), replaced with code that throws`,
                );
              }
            }

            return { value: steps, hasChanged: inlinedCodeSteps.length > 0 };
          },
        }),
      );
    }

    const [coreWorkflowVersionCount, workflowVersionCount = 0] =
      rewrittenRowCounts;

    // runs are created from the cached versions, so they must see the inlined steps before runs are scanned
    if (!isDryRun && coreWorkflowVersionCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }

    const referencedLogicFunctionIds = await this.findReferencedLogicFunctionIds(
      {
        dataSource,
        workspaceId,
        schemaName,
        workflowVersionSources,
        versionReferencesBeforeRewrite: isDryRun
          ? versionReferences.filter(
              ({ isLegacyCodeStep }) => !isLegacyCodeStep,
            )
          : undefined,
      },
    );

    const [{ workspaceCustomApplicationId }]: {
      workspaceCustomApplicationId: string | null;
    }[] = await dataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
      [workspaceId],
    );
    const workspaceCustomFlatApplication = isDefined(
      workspaceCustomApplicationId,
    )
      ? flatApplicationMaps.byId[workspaceCustomApplicationId]
      : undefined;

    // other applications own the functions they declare, only the custom application's are code step functions
    const flatLogicFunctionsToDelete = [...recoveredLogicFunctionIds]
      .filter(
        (logicFunctionId) => !referencedLogicFunctionIds.has(logicFunctionId),
      )
      .map((logicFunctionId) => flatLogicFunctionById.get(logicFunctionId))
      .filter(isDefined)
      .filter(
        ({ applicationId }) =>
          applicationId === workspaceCustomFlatApplication?.id,
      )
      .filter(hasNoTriggerOutsideWorkflows);

    const deletedLogicFunctionCount =
      isDryRun || !isDefined(workspaceCustomFlatApplication)
        ? flatLogicFunctionsToDelete.length
        : await this.deleteLogicFunctions({
            workspaceId,
            workspaceCustomFlatApplication,
            flatLogicFunctionsToDelete,
          });

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: inlined the code of ${coreWorkflowVersionCount} core workflow version(s) and ${workflowVersionCount} workflow version(s), and deleted ${deletedLogicFunctionCount} code step function(s)`,
    );
  }

  private async readSources({
    workspaceId,
    flatApplicationMaps,
    flatLogicFunctions,
  }: {
    workspaceId: string;
    flatApplicationMaps: FlatApplicationCacheMaps;
    flatLogicFunctions: FlatLogicFunction[];
  }): Promise<Map<string, string>> {
    const sourceByLogicFunctionId = new Map<string, string>();

    for (const batch of chunk(flatLogicFunctions, SOURCE_READ_BATCH_SIZE)) {
      const sources = await Promise.all(
        batch.map(({ applicationId, sourceHandlerPath }) => {
          const applicationUniversalIdentifier =
            flatApplicationMaps.byId[applicationId]?.universalIdentifier;

          return isDefined(applicationUniversalIdentifier)
            ? this.readSource({
                workspaceId,
                applicationUniversalIdentifier,
                sourceHandlerPath,
              })
            : null;
        }),
      );

      batch.forEach(({ id }, index) => {
        const source = sources[index];

        if (!isNonEmptyString(source)) {
          return;
        }

        sourceByLogicFunctionId.set(
          id,
          source.length > CODE_STEP_SOURCE_MAX_LENGTH
            ? OVERSIZED_CODE_STEP_SOURCE
            : source,
        );
      });
    }

    return sourceByLogicFunctionId;
  }

  private async readSource({
    workspaceId,
    applicationUniversalIdentifier,
    sourceHandlerPath,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    sourceHandlerPath: string;
  }): Promise<string | null> {
    try {
      const stream = await this.fileStorageService.readFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: sourceHandlerPath,
      });

      return (await streamToBuffer(stream)).toString('utf-8');
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }

  // a dry run did not rewrite the versions, so it reuses what they will reference once inlined
  private async findReferencedLogicFunctionIds({
    dataSource,
    workspaceId,
    schemaName,
    workflowVersionSources,
    versionReferencesBeforeRewrite,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    schemaName: string;
    workflowVersionSources: StepSource[];
    versionReferencesBeforeRewrite?: StepLogicFunctionReference[];
  }): Promise<Set<string>> {
    const versionReferences =
      versionReferencesBeforeRewrite ??
      (await this.findReferences({
        dataSource,
        sources: workflowVersionSources,
      }));

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
             AND (jsonb_typeof(step->'settings'->'input'->'code') IS DISTINCT FROM 'string'
               OR step->'settings'->'input'->>'code' = '')) AS "isLegacyCodeStep"
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

  private async deleteLogicFunctions({
    workspaceId,
    workspaceCustomFlatApplication,
    flatLogicFunctionsToDelete,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
    flatLogicFunctionsToDelete: FlatLogicFunction[];
  }): Promise<number> {
    if (flatLogicFunctionsToDelete.length === 0) {
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

    // the steps are already inlined, so a function that cannot be deleted is only left over
    if (result.status === 'fail') {
      this.logger.error(
        `Workspace ${workspaceId}: could not delete ${flatLogicFunctionsToDelete.length} code step function(s): ${JSON.stringify(result)}`,
      );

      return 0;
    }

    return flatLogicFunctionsToDelete.length;
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
