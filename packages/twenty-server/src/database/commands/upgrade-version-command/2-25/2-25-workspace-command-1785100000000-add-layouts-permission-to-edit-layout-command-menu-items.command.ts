import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

const EDIT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  'd9794c67-1799-424f-8871-5ea771dd4a6d';
const EDIT_DASHBOARD_LAYOUT_UNIVERSAL_IDENTIFIER =
  'b9b53bbc-3129-4eb9-8344-c3f9628ffa7d';

const LAYOUTS_PERMISSION_CONDITION = 'permissionFlags.LAYOUTS';

@RegisteredWorkspaceCommand('2.25.0', 1785100000000)
@Command({
  name: 'upgrade:2-25:add-layouts-permission-to-edit-layout-command-menu-items',
  description:
    'Add LAYOUTS permission flag condition to Edit Layout and Edit Dashboard command menu items',
})
export class AddLayoutsPermissionToEditLayoutCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
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
        `[DRY RUN] Would add LAYOUTS permission condition to edit layout command menu items for workspace ${workspaceId}. Skipping.`,
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
        SET "conditionalAvailabilityExpression" =
          "conditionalAvailabilityExpression" || ' and ' || $3
        WHERE "workspaceId" = $1
          AND "universalIdentifier" = ANY($2)
          AND "conditionalAvailabilityExpression" IS NOT NULL
          AND "conditionalAvailabilityExpression" NOT LIKE '%' || $3 || '%'
        `,
        [
          workspaceId,
          [
            EDIT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
            EDIT_DASHBOARD_LAYOUT_UNIVERSAL_IDENTIFIER,
          ],
          LAYOUTS_PERMISSION_CONDITION,
        ],
      );

      const updateCount = result?.[1] ?? 0;

      if (updateCount === 0) {
        this.logger.log(
          `Edit layout command menu items already up to date for workspace ${workspaceId}`,
        );
      } else {
        this.logger.log(
          `Added LAYOUTS permission condition to ${updateCount} command menu item(s) for workspace ${workspaceId}`,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(
        `Error adding LAYOUTS permission condition to edit layout command menu items for workspace ${workspaceId}`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
