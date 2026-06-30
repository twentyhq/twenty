import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

const EDIT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  'd9794c67-1799-424f-8871-5ea771dd4a6d';

@RegisteredWorkspaceCommand('1.21.0', 1775500009000)
@Command({
  name: 'upgrade:1-21:update-edit-layout-command-menu-item-label',
  description: 'Update Edit Page Layout command menu item label to Edit Layout',
})
export class UpdateEditLayoutCommandMenuItemLabelCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
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
