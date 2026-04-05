import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';

@Command({
  name: 'upgrade:1-20:update-standard-index-view-names',
  description:
    'Update standard index view names to use translatable template placeholders',
})
export class UpdateStandardIndexViewNamesCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
        `[DRY RUN] Would update standard index view names for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.query(
        `
        UPDATE core."view"
        SET name = 'All {objectLabelPlural}'
        WHERE "workspaceId" = $1
          AND "isCustom" = false
          AND key = 'INDEX'
          AND name LIKE 'All %'
          AND name != 'All {objectLabelPlural}'
        `,
        [workspaceId],
      );

      const updateCount = result?.[1] ?? 0;

      if (updateCount === 0) {
        this.logger.log(
          `No standard index views needed updating for workspace ${workspaceId}`,
        );
      } else {
        this.logger.log(
          `Updated ${updateCount} standard index view(s) for workspace ${workspaceId}`,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(
        `Error updating standard index view names for workspace ${workspaceId}`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
