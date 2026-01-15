import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { addKanbanViewIntegrityConstraintQueries } from 'src/database/typeorm/core/migrations/utils/1768487716249-addKanbanViewIntegrityConstraint.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-16:add-kanban-view-integrity-constraint-migration',
  description:
    'Add CHK_VIEW_KANBAN_INTEGRITY constraint to require kanbanAggregateOperationFieldMetadataId for kanban views',
})
export class AddKanbanViewIntegrityConstraintMigrationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
        'Skipping - has already been run once AddKanbanViewIntegrityConstraintMigrationCommand',
      );

      return;
    }

    if (options.dryRun) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await addKanbanViewIntegrityConstraintQueries(queryRunner);

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully added CHK_VIEW_KANBAN_INTEGRITY constraint',
      );
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back AddKanbanViewIntegrityConstraintMigrationCommand: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
