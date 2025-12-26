import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-13:update-role-targets-unique-constraint-migration',
  description:
    'Update roleTargets unique constraints from combined to separate constraints',
})
export class UpdateRoleTargetsUniqueConstraintMigrationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
      this.logger.log(
        'Skipping has already been run once UpdateRoleTargetsUniqueConstraintMigrationCommand',
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (!options.dryRun) {
      try {
        await queryRunner.query(
          `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE"`,
        );
        await queryRunner.query(
          `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_API_KEY" UNIQUE ("workspaceId", "apiKeyId")`,
        );
        await queryRunner.query(
          `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_AGENT" UNIQUE ("workspaceId", "agentId")`,
        );
        await queryRunner.query(
          `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE" UNIQUE ("workspaceId", "userWorkspaceId")`,
        );

        await queryRunner.commitTransaction();
        this.logger.log(
          'Successfully run UpdateRoleTargetsUniqueConstraintMigrationCommand',
        );
        this.hasRunOnce = true;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.log(
          `Rollbacking UpdateRoleTargetsUniqueConstraintMigrationCommand: ${error.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    }
  }
}
