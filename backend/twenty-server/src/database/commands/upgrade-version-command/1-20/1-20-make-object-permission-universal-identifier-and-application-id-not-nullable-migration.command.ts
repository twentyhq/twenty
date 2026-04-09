import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { makeObjectPermissionUniversalIdentifierAndApplicationIdNotNullQueries } from 'src/database/typeorm/core/migrations/utils/1773317160558-make-object-permission-universal-identifier-and-application-id-not-null.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-20:make-object-permission-universal-identifier-and-application-id-not-nullable-migration',
  description:
    'Set NOT NULL on objectPermission universalIdentifier and applicationId, add unique index and FK (run identify-object-permission-metadata first)',
})
export class MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
        'Skipping has already been run once MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand',
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
      await makeObjectPermissionUniversalIdentifierAndApplicationIdNotNullQueries(
        queryRunner,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully run MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand',
      );
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
