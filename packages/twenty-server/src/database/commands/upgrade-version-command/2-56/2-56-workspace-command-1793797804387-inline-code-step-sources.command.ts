import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { CODE_STEP_SOURCE_MAX_LENGTH } from 'twenty-shared/workflow';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { inlineCodeStepSources } from 'src/database/commands/upgrade-version-command/2-56/utils/inline-code-step-sources.util';
import {
  rewriteJsonbRowsWithCompareAndSet,
  type StoredJsonbRow,
} from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
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
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const SOURCE_READ_BATCH_SIZE = 20;

type StepSource = {
  tableName: string;
  whereClause: string;
  whereParameters: unknown[];
};

// expand only: steps keep logicFunctionId and no function is deleted, so a rollback still runs them
@RegisteredWorkspaceCommand('2.56.0', 1793797804387)
@Command({
  name: 'upgrade:2-56:inline-code-step-sources',
  description:
    'Copy the source of the hidden logic function behind each legacy workflow CODE step into the step, keeping the function',
})
export class InlineCodeStepSourcesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileStorageService: FileStorageService,
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
        whereClause: 'true',
        whereParameters: [],
      });
    }

    const legacyLogicFunctionIds = await this.findLegacyLogicFunctionIds({
      dataSource,
      sources: workflowVersionSources,
    });

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

    const sourceByLogicFunctionId = await this.readSources({
      workspaceId,
      flatApplicationMaps,
      flatLogicFunctions: legacyLogicFunctionIds
        .map((logicFunctionId) => flatLogicFunctionById.get(logicFunctionId))
        .filter(isDefined),
    });
    const existingLogicFunctionIds = new Set(flatLogicFunctionById.keys());

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
              existingLogicFunctionIds,
            });

            for (const { stepId, logicFunctionId } of inlinedCodeSteps) {
              if (!sourceByLogicFunctionId.has(logicFunctionId)) {
                this.logger.warn(
                  `Workspace ${workspaceId}: function ${logicFunctionId} of code step ${String(stepId)} in ${source.tableName} ${id} is gone, replaced with code that throws`,
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

    if (!isDryRun && coreWorkflowVersionCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: inlined the code of ${coreWorkflowVersionCount} core workflow version(s) and ${workflowVersionCount} workflow version(s)`,
    );
  }

  private async readSources({
    workspaceId,
    flatApplicationMaps,
    flatLogicFunctions,
  }: {
    workspaceId: string;
    flatApplicationMaps: Pick<FlatApplicationCacheMaps, 'byId'>;
    flatLogicFunctions: FlatLogicFunction[];
  }): Promise<Map<string, string>> {
    const sourceByLogicFunctionId = new Map<string, string>();

    for (const batch of chunk(flatLogicFunctions, SOURCE_READ_BATCH_SIZE)) {
      const sources = await Promise.all(
        batch.map(({ id, applicationId, sourceHandlerPath }) => {
          const applicationUniversalIdentifier =
            flatApplicationMaps.byId[applicationId]?.universalIdentifier;

          if (!isDefined(applicationUniversalIdentifier)) {
            this.logger.warn(
              `Workspace ${workspaceId}: application ${applicationId} of function ${id} is missing, its code steps keep running from the function`,
            );

            return undefined;
          }

          return this.readSource({
            workspaceId,
            applicationUniversalIdentifier,
            sourceHandlerPath,
          });
        }),
      );

      batch.forEach(({ id, sourceHandlerPath }, index) => {
        const source = sources[index];

        if (isUndefined(source)) {
          return;
        }

        if (!isNonEmptyString(source)) {
          this.logger.warn(
            `Workspace ${workspaceId}: the source ${sourceHandlerPath} of function ${id} is missing or empty, its code steps keep running from the function`,
          );

          return;
        }

        if (source.length > CODE_STEP_SOURCE_MAX_LENGTH) {
          this.logger.warn(
            `Workspace ${workspaceId}: the source of function ${id} is over the code step size limit, its code steps keep running from the function`,
          );

          return;
        }

        // jsonb rejects NUL, and one such source would fail the whole workspace
        if (source.includes('\0')) {
          this.logger.warn(
            `Workspace ${workspaceId}: the source of function ${id} contains a NUL character, its code steps keep running from the function`,
          );

          return;
        }

        sourceByLogicFunctionId.set(id, source);
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

  private async findLegacyLogicFunctionIds({
    dataSource,
    sources,
  }: {
    dataSource: DataSource;
    sources: StepSource[];
  }): Promise<string[]> {
    const logicFunctionIds = new Set<string>();

    for (const { tableName, whereClause, whereParameters } of sources) {
      const rows: { logicFunctionId: string }[] = await dataSource.query(
        `SELECT DISTINCT step->'settings'->'input'->>'logicFunctionId' AS "logicFunctionId"
         FROM ${tableName}
         CROSS JOIN LATERAL jsonb_array_elements(
           CASE WHEN jsonb_typeof(steps) = 'array' THEN steps ELSE '[]'::jsonb END
         ) AS step
         WHERE (${whereClause})
           AND step->>'type' = 'CODE'
           AND jsonb_typeof(step->'settings'->'input'->'logicFunctionId') = 'string'
           AND (jsonb_typeof(step->'settings'->'input'->'code') IS DISTINCT FROM 'string'
             OR step->'settings'->'input'->>'code' = '')`,
        whereParameters,
      );

      rows.forEach(({ logicFunctionId }) =>
        logicFunctionIds.add(logicFunctionId),
      );
    }

    return [...logicFunctionIds];
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
