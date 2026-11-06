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
import { clearIfElseNextStepIds } from 'src/database/commands/upgrade-version-command/2-57/utils/clear-if-else-next-step-ids.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const IF_ELSE_WITH_NEXT_STEP_IDS_JSON_PATH =
  '$[*] ? (@.type == "IF_ELSE" && @.nextStepIds.type() == "array" && @.nextStepIds.size() > 0)';

// Runs are not rewritten: from 2.57 the executor ignores these next steps, as it always did when choosing what runs
@RegisteredWorkspaceCommand('2.57.0', 1793954626110)
@Command({
  name: 'upgrade:2-57:clear-if-else-next-step-ids',
  description:
    'Clear the next steps that If/Else steps list outside their branches, which runs never followed and writes now refuse',
})
export class ClearIfElseNextStepIdsCommand extends ProvisionedWorkspaceCommandRunner {
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
        `No data source for workspace ${workspaceId}, skipping If/Else next step cleanup`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    const workspaceVersionTable = `"${getWorkspaceSchemaName(workspaceId)}"."workflowVersion"`;

    const clearSteps = ({ id, value }: StoredJsonbRow<unknown>) => {
      const cleared = clearIfElseNextStepIds(value);

      for (const { stepId, nextStepIds } of cleared.clearedNextStepIds) {
        this.logger.log(
          `Workspace ${workspaceId}: workflow version ${id} If/Else step ${String(stepId)} no longer lists next steps ${JSON.stringify(nextStepIds)} outside its branches`,
        );
      }

      return { value: cleared.steps, hasChanged: cleared.hasChanged };
    };

    const coreVersionCount = await rewriteJsonbRowsWithCompareAndSet({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND jsonb_path_exists(steps, $2::jsonpath)`,
      whereParameters: [workspaceId, IF_ELSE_WITH_NEXT_STEP_IDS_JSON_PATH],
      mapRow: clearSteps,
    });

    const workspaceVersionCount = (await this.tableExists({
      dataSource,
      tableName: workspaceVersionTable,
    }))
      ? await rewriteJsonbRowsWithCompareAndSet({
          dataSource,
          isDryRun,
          tableName: workspaceVersionTable,
          columnName: 'steps',
          whereClause: 'jsonb_path_exists(steps, $1::jsonpath)',
          whereParameters: [IF_ELSE_WITH_NEXT_STEP_IDS_JSON_PATH],
          mapRow: clearSteps,
        })
      : 0;

    if (coreVersionCount + workspaceVersionCount === 0) {
      return;
    }

    if (!isDryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Cleared If/Else next steps outside branches in ${coreVersionCount} core version(s) and ${workspaceVersionCount} workspace version(s) for workspace ${workspaceId}`,
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
}
