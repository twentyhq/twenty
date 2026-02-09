import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-17:add-file-entity-unique-constraint',
  description:
    'Add unique constraint on (workspaceId, applicationId, path) to file entity',
})
export class AddFileEntityUniqueConstraintCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private hasRunOnce = false;

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
      this.logger.warn(
        'Skipping has already been run once AddFileEntityUniqueConstraintCommand',
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
      // Remove duplicate file records before adding the constraint
      await queryRunner.query(`
        DELETE FROM "core"."file"
        WHERE "id" NOT IN (
          SELECT MIN("id")
          FROM "core"."file"
          GROUP BY "workspaceId", "applicationId", "path"
        )
      `);

      await queryRunner.query(
        `ALTER TABLE "core"."file" ADD CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE" UNIQUE ("workspaceId", "applicationId", "path")`,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully run AddFileEntityUniqueConstraintCommand',
      );
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back AddFileEntityUniqueConstraintCommand: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
