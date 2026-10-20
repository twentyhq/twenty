import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { buildCompanyOpportunityTargetBackfillQueries } from 'src/database/commands/upgrade-version-command/2-50/utils/build-company-opportunity-target-backfill-queries.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const BACKFILL_BATCH_SIZE = 5_000;

@RegisteredWorkspaceCommand('2.50.0', 1792489506688)
@Command({
  name: 'upgrade:2-50:backfill-company-opportunity-targets',
  description:
    "Link existing emails and calendar events to the opportunities of their participants' companies",
})
export class BackfillCompanyOpportunityTargetsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {}

  async up({
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
        AND to_regclass($2) IS NOT NULL AS ready`,
      ['messageThreadTarget', 'calendarEventTarget'].map(
        (tableName) => `"${schemaName}"."${tableName}"`,
      ),
    );

    if (!tables?.ready) {
      this.logger.warn(
        `Skipping workspace ${workspaceId}: target tables are not provisioned`,
      );

      return;
    }

    for (const query of buildCompanyOpportunityTargetBackfillQueries({
      schemaName,
      batchSize: BACKFILL_BATCH_SIZE,
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
      } while (candidateCount === BACKFILL_BATCH_SIZE);

      this.logger.log(
        `Created ${insertedCount} ${query.label} for workspace ${workspaceId}`,
      );
    }
  }
}
