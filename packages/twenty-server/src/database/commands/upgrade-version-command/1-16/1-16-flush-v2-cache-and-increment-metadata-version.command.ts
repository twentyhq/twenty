import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@Command({
  name: 'upgrade:1-16:flush-v2-cache-and-increment-metadata-version',
  description: 'Flush the whole v2 cache and increment the metadata version',
})
export class FlushV2CacheAndIncrementMetadataVersionCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Flushing v2 cache and incrementing metadata version for workspace ${workspaceId}`,
    );

    if (options.dryRun) {
      this.logger.log(
        `DRY RUN: Would flush v2 cache and increment metadata version for workspace ${workspaceId}`,
      );

      return;
    }

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: ALL_FLAT_ENTITY_MAPS_PROPERTIES,
      workspaceId,
    });

    this.logger.log(
      `Successfully flushed v2 cache and incremented metadata version for workspace ${workspaceId}`,
    );
  }
}
