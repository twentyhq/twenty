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
import { dropFieldsToUpdateFromCreateAndUpsertRecords } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-fields-to-update-from-create-and-upsert-records.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.57.0', 1793954288001)
@Command({
  name: 'upgrade:2-57:drop-fields-to-update-from-create-and-upsert-records',
  description:
    'Remove fieldsToUpdate from create and upsert record steps, which write their whole objectRecord and now refuse it',
})
export class DropFieldsToUpdateFromCreateAndUpsertRecordsCommand extends ProvisionedWorkspaceCommandRunner {
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
        `No data source for workspace ${workspaceId}, skipping fieldsToUpdate cleanup`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    const workspaceVersionTable = `"${getWorkspaceSchemaName(workspaceId)}"."workflowVersion"`;

    const dropFieldsToUpdate = ({ value }: StoredJsonbRow<unknown>) => {
      const result = dropFieldsToUpdateFromCreateAndUpsertRecords(value);

      for (const {
        stepId,
        fieldsToUpdate,
      } of result.droppedNonEmptyFieldsToUpdate) {
        this.logger.warn(
          `Workspace ${workspaceId}: step ${String(stepId)} dropped fieldsToUpdate ${JSON.stringify(fieldsToUpdate)}, which never applied since the step writes its whole objectRecord`,
        );
      }

      return { value: result.steps, hasChanged: result.hasChanged };
    };

    const coreVersionCount = await rewriteJsonbRowsWithCompareAndSet({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND steps::text LIKE '%fieldsToUpdate%'`,
      whereParameters: [workspaceId],
      mapRow: dropFieldsToUpdate,
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
          whereClause: `steps::text LIKE '%fieldsToUpdate%'`,
          whereParameters: [],
          mapRow: dropFieldsToUpdate,
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
      `${isDryRun ? '[DRY RUN] ' : ''}Dropped fieldsToUpdate from create and upsert record steps in ${coreVersionCount} core version(s) and ${workspaceVersionCount} workspace version(s) for workspace ${workspaceId}`,
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
