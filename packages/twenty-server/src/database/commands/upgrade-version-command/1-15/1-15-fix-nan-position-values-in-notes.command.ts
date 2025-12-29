import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-15:fix-nan-position-values-in-notes',
  description: 'Fix NaN position values in notes by replacing them with 2',
})
export class FixNanPositionValuesInNotesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    FixNanPositionValuesInNotesCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
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

    if (isDryRun) {
      this.logger.log('Dry run mode: No changes will be applied');
    }

    try {
      // Count NaN position values in notes
      const noteRepository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'note',
        { shouldBypassPermissionChecks: true },
      );

      const nanCount = await noteRepository.count({
        where: { position: 'NaN' },
      });

      this.logger.log(
        `Found ${nanCount} note(s) with NaN position values in workspace ${workspaceId}`,
      );

      if (nanCount === 0) {
        this.logger.log('No NaN position values to fix');

        return;
      }

      if (!isDryRun) {
        // Update NaN position values to 2 because 1 is first position
        await noteRepository
          .createQueryBuilder()
          .update()
          .set({ position: 2 })
          .where('position = :nanString', { nanString: 'NaN' })
          .execute();

        this.logger.log(
          `Fixed ${nanCount} NaN position value(s) in notes for workspace ${workspaceId}`,
        );
      } else {
        this.logger.log(
          `DRY RUN: Would fix ${nanCount} NaN position value(s) in notes for workspace ${workspaceId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Could not fix NaN position values in notes for workspace ${workspaceId}`,
      );
      this.logger.error(error);
    }
  }
}
