import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { addGlobalKeyValuePairUniqueIndexQueries } from 'src/database/typeorm/core/migrations/utils/1774700000000-add-global-key-value-pair-unique-index.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-21:add-global-key-value-pair-unique-index',
  description:
    'Deduplicate global keyValuePair rows and add the null/null unique index',
})
export class AddGlobalKeyValuePairUniqueIndexCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private hasRunOnce = false;

  private async deduplicateGlobalKeyValuePairs(
    queryRunner: DataSource['createQueryRunner'] extends () => infer T
      ? T
      : never,
  ): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "core"."keyValuePair"
      WHERE id IN (
        SELECT id
        FROM (
          SELECT
            id,
            ROW_NUMBER() OVER (
              PARTITION BY key
              ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
            ) AS row_number
          FROM "core"."keyValuePair"
          WHERE "userId" IS NULL
            AND "workspaceId" IS NULL
        ) ranked_key_value_pairs
        WHERE ranked_key_value_pairs.row_number > 1
      )
    `);
  }

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (this.hasRunOnce) {
      this.logger.log(
        'Skipping has already been run once AddGlobalKeyValuePairUniqueIndexCommand',
      );

      return;
    }

    if (options.dryRun) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.deduplicateGlobalKeyValuePairs(queryRunner);
      await addGlobalKeyValuePairUniqueIndexQueries(queryRunner);

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully run AddGlobalKeyValuePairUniqueIndexCommand',
      );
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back AddGlobalKeyValuePairUniqueIndexCommand: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
