import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { buildInitialCompanyTargetRepairQueries } from 'src/database/commands/repair-initial-company-targets/utils/build-initial-company-target-repair-queries.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const REPAIR_BATCH_SIZE = 5_000;

@Command({
  name: 'workspace:repair-initial-company-targets',
  description:
    'Restore missing company activity targets supported by initial-assignment audit history',
})
export class RepairInitialCompanyTargetsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      throw new Error(`No workspace data source for ${workspaceId}`);
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const [tables] = await dataSource.query<Array<{ ready: boolean }>>(
      `SELECT to_regclass($1) IS NOT NULL
        AND to_regclass($2) IS NOT NULL
        AND to_regclass($3) IS NOT NULL AS ready`,
      ['messageThreadTarget', 'calendarEventTarget', 'timelineActivity'].map(
        (tableName) => `"${schemaName}"."${tableName}"`,
      ),
    );

    if (!tables?.ready) {
      this.logger.warn(
        `Skipping workspace ${workspaceId}: target or audit tables are not provisioned`,
      );

      return;
    }

    for (const query of buildInitialCompanyTargetRepairQueries({
      schemaName,
      batchSize: REPAIR_BATCH_SIZE,
    })) {
      if (options.dryRun) {
        const [result] = await dataSource.query<Array<{ count: number }>>(
          query.countSql,
        );

        this.logger.log(
          `[DRY RUN] Would create ${result.count} ${query.label} for workspace ${workspaceId}`,
        );

        continue;
      }

      let candidateCount: number;
      let insertedCount = 0;

      do {
        const [result] = await dataSource.query<
          Array<{ candidateCount: number; insertedCount: number }>
        >(query.insertSql);

        candidateCount = result.candidateCount;
        insertedCount += result.insertedCount;
      } while (candidateCount === REPAIR_BATCH_SIZE);

      this.logger.log(
        `Created ${insertedCount} ${query.label} for workspace ${workspaceId}`,
      );
    }
  }
}
