import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-17:migrate-date-time-is-filter-values',
  description: 'Migrate DATE_TIME IS operand values from Instant to Plain Date',
})
export class MigrateDateTimeIsFilterValuesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    MigrateDateTimeIsFilterValuesCommand.name,
    {},
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    this.logger.log(`Processing workspace ${workspaceId}`);

    const viewFilters = await this.viewFilterRepository.find({
      where: {
        workspaceId,
      },
      relations: ['fieldMetadata'],
    });

    const filtersToUpdate = viewFilters.filter((filter) => {
      if (
        !filter.fieldMetadata ||
        filter.fieldMetadata.type !== FieldMetadataType.DATE_TIME ||
        filter.operand !== ViewFilterOperand.IS
      ) {
        return false;
      }

      const value = filter.value;

      if (typeof value !== 'string') {
        return false;
      }

      return value.includes('T');
    });

    if (filtersToUpdate.length === 0) {
      return;
    }

    this.logger.log(
      `Found ${filtersToUpdate.length} filters to migrate in workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `Dry run: would update ${filtersToUpdate.length} filters`,
      );

      return;
    }

    let updatedCount = 0;

    for (const filter of filtersToUpdate) {
      try {
        const newDate = (filter.value as string).split('T')[0];

        if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
          this.logger.warn(
            `Skipping invalid date extraction for filter ${filter.id}: ${filter.value} -> ${newDate}`,
          );
          continue;
        }

        await this.viewFilterRepository.update(filter.id, {
          value: newDate,
        });
        updatedCount++;
      } catch (err) {
        this.logger.error(
          `Failed to migrate filter ${filter.id}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.logger.log(
      `Migrated ${updatedCount} filters in workspace ${workspaceId}`,
    );
  }
}
