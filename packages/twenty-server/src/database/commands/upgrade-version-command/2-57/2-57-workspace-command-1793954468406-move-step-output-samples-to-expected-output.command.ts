import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { inputSchemaToOutputSchema } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rewriteJsonbRowsWithCompareAndSet } from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { moveStepOutputSamplesToExpectedOutput } from 'src/database/commands/upgrade-version-command/2-57/utils/move-step-output-samples-to-expected-output.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// the server derives these steps' output schema from expectedOutputSchema, so a test-run schema moves there
@RegisteredWorkspaceCommand('2.57.0', 1793954468406)
@Command({
  name: 'upgrade:2-57:move-step-output-samples-to-expected-output',
  description:
    'Store the sample behind the output schema of CODE, HTTP_REQUEST and LOGIC_FUNCTION workflow steps in expectedOutputSchema',
})
export class MoveStepOutputSamplesToExpectedOutputCommand extends ProvisionedWorkspaceCommandRunner {
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
        `No data source for workspace ${workspaceId}, skipping step output samples`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    const { flatLogicFunctionMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatObjectMetadataMaps',
      ]);

    const declaredOutputSchemaByLogicFunctionId = new Map<
      string,
      BaseOutputSchemaV2
    >();

    for (const flatLogicFunction of Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    )) {
      const declaredInputSchema =
        flatLogicFunction?.workflowActionTriggerSettings?.outputSchema;

      if (isDefined(flatLogicFunction) && isDefined(declaredInputSchema)) {
        declaredOutputSchemaByLogicFunctionId.set(
          flatLogicFunction.id,
          inputSchemaToOutputSchema(declaredInputSchema),
        );
      }
    }

    const sources: {
      tableName: string;
      whereClause: string;
      whereParameters: string[];
    }[] = [
      {
        tableName: 'core."workflowVersion"',
        whereClause: '"workspaceId" = $1',
        whereParameters: [workspaceId],
      },
    ];

    const workspaceTableName = `${schemaName}."workflowVersion"`;

    if (
      isDefined(
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        }),
      ) &&
      (await this.hasTable({ dataSource, tableName: workspaceTableName }))
    ) {
      sources.push({
        tableName: workspaceTableName,
        whereClause: 'true',
        whereParameters: [],
      });
    }

    const rewrittenRowCounts: number[] = [];

    for (const source of sources) {
      let changedRowCount = 0;

      const rewrittenRowCount =
        await rewriteJsonbRowsWithCompareAndSet<unknown>({
          dataSource,
          isDryRun,
          tableName: source.tableName,
          columnName: 'steps',
          whereClause: `${source.whereClause} AND (steps @> '[{"type":"CODE"}]' OR steps @> '[{"type":"HTTP_REQUEST"}]' OR steps @> '[{"type":"LOGIC_FUNCTION"}]')`,
          whereParameters: source.whereParameters,
          mapRow: ({ value }) => {
            const { steps, movedStepIds } =
              moveStepOutputSamplesToExpectedOutput({
                steps: value,
                declaredOutputSchemaByLogicFunctionId,
              });

            const hasChanged = movedStepIds.length > 0;

            changedRowCount += hasChanged ? 1 : 0;

            return { value: steps, hasChanged };
          },
        });

      // the compare-and-set write skips a row edited since it was read; a later run moves it
      if (rewrittenRowCount < changedRowCount) {
        this.logger.warn(
          `Workspace ${workspaceId}: ${changedRowCount - rewrittenRowCount} row(s) of ${source.tableName} changed during the move and were skipped`,
        );
      }

      rewrittenRowCounts.push(rewrittenRowCount);
    }

    const [coreWorkflowVersionCount, workflowVersionCount = 0] =
      rewrittenRowCounts;

    if (!isDryRun && coreWorkflowVersionCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: moved step output samples in ${coreWorkflowVersionCount} core workflow version(s) and ${workflowVersionCount} workflow version(s)`,
    );
  }

  private async hasTable({
    dataSource,
    tableName,
  }: {
    dataSource: DataSource;
    tableName: string;
  }): Promise<boolean> {
    const [table]: { name: string | null }[] = await dataSource.query(
      'SELECT to_regclass($1) AS name',
      [tableName],
    );

    return isDefined(table?.name);
  }
}
