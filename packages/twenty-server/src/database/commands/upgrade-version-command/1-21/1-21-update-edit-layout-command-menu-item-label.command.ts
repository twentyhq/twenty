import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

const EDIT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  'd9794c67-1799-424f-8871-5ea771dd4a6d';

@Command({
  name: 'upgrade:1-21:update-edit-layout-command-menu-item-label',
  description: 'Update Edit Page Layout command menu item label to Edit Layout',
})
export class UpdateEditLayoutCommandMenuItemLabelCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would update Edit Layout command menu item label for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.query(
        `
        UPDATE core."commandMenuItem"
        SET label = 'Edit Layout', "shortLabel" = 'Edit Layout'
        WHERE "workspaceId" = $1
          AND "universalIdentifier" = $2
          AND (label != 'Edit Layout' OR "shortLabel" != 'Edit Layout')
        `,
        [workspaceId, EDIT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
      );

      const updateCount = result?.[1] ?? 0;

      if (updateCount === 0) {
        this.logger.log(
          `Edit Layout command menu item already up to date for workspace ${workspaceId}`,
        );
      } else {
        this.logger.log(
          `Updated Edit Layout command menu item label for workspace ${workspaceId}`,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(
        `Error updating Edit Layout command menu item label for workspace ${workspaceId}`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
