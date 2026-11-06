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
import { dropUndeclaredKeysFromCreateAndUpsertRecords } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-undeclared-keys-from-create-and-upsert-records.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.57.0', 1793954288001)
@Command({
  name: 'upgrade:2-57:drop-undeclared-keys-from-create-and-upsert-records',
  description:
    'Remove keys the create and upsert record step inputs do not declare, such as fieldsToUpdate, which those inputs now refuse',
})
export class DropUndeclaredKeysFromCreateAndUpsertRecordsCommand extends ProvisionedWorkspaceCommandRunner {
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
        `No data source for workspace ${workspaceId}, skipping create and upsert record step cleanup`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    const workspaceVersionTable = `"${getWorkspaceSchemaName(workspaceId)}"."workflowVersion"`;

    const dropUndeclaredKeys = ({ value }: StoredJsonbRow<unknown>) => {
      const result = dropUndeclaredKeysFromCreateAndUpsertRecords(value);

      for (const { stepId, keys } of result.droppedInputKeys) {
        this.logger.warn(
          `Workspace ${workspaceId}: step ${String(stepId)} dropped input keys ${keys.join(', ')}, which never applied at run time`,
        );
      }

      return { value: result.steps, hasChanged: result.hasChanged };
    };

    const coreVersionCount = await rewriteJsonbRowsWithCompareAndSet({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND (steps::text LIKE '%CREATE_RECORD%' OR steps::text LIKE '%UPSERT_RECORD%')`,
      whereParameters: [workspaceId],
      mapRow: dropUndeclaredKeys,
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
          whereClause: `steps::text LIKE '%CREATE_RECORD%' OR steps::text LIKE '%UPSERT_RECORD%'`,
          whereParameters: [],
          mapRow: dropUndeclaredKeys,
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
      `${isDryRun ? '[DRY RUN] ' : ''}Dropped undeclared keys from create and upsert record steps in ${coreVersionCount} core version(s) and ${workspaceVersionCount} workspace version(s) for workspace ${workspaceId}`,
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
