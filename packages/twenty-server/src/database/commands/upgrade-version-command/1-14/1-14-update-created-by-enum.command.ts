import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'upgrade:1-14:udpate-created-by-enum',
  description: 'Add new APPLICATION value to createdBy enum',
})
export class UpdateCreatedByEnumCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(UpdateCreatedByEnumCommand.name);

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
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    if (!isDefined(dataSource)) {
      throw new Error(
        `Could not find data source for workspace ${workspaceId}, should never occur`,
      );
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdByEnums = await queryRunner.query(
      `SELECT t.typname
       FROM pg_type t
       JOIN pg_namespace n ON n.oid = t.typnamespace
       WHERE t.typtype = 'e'
         AND n.nspname = '${schemaName}'
         AND t.typname LIKE '%\\_createdBySource\\_enum' ESCAPE '\\'
         AND NOT EXISTS (
           SELECT 1
           FROM pg_enum e
           WHERE e.enumtypid = t.oid
             AND e.enumlabel = 'APPLICATION'
         );`,
    );

    if (isDryRun) {
      this.logger.log(
        `Dry run mode: found ${createdByEnums.length} createdBy enums to update`,
      );
    }

    if (!options.dryRun) {
      this.logger.log(`Updating ${createdByEnums.length} createdBy enums`);
      try {
        for (const createdByEnum of createdByEnums) {
          await queryRunner.query(
            `ALTER TYPE "${schemaName}"."${createdByEnum.typname}" ADD VALUE 'APPLICATION'`,
          );
        }
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.log(
          `Rollbacking UpdateCreatedByEnumCommand: ${error.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    }
  }
}
