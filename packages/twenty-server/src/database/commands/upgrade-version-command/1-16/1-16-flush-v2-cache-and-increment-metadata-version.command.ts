import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-core-views-graphql-operation.constant';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

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
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
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

    await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
    });

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    await this.workspaceCacheStorageService.flushGraphQLOperation({
      operationName: FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION,
      workspaceId,
    });

    this.logger.log(
      `Successfully flushed v2 cache and incremented metadata version for workspace ${workspaceId}`,
    );
  }
}
