import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@Command({
  name: 'upgrade:1-18:delete-orphan-favorites',
  description:
    'Delete favorites whose viewId does not exist in workspace view metadata (fixes upgrade failure)',
})
export class DeleteOrphanFavoritesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(DeleteOrphanFavoritesCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(`Deleting orphan favorites for workspace ${workspaceId}`);

    const { flatViewMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatViewMaps'],
    );

    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepository<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
        { shouldBypassPermissionChecks: true },
      );

    const favoritesWithViewId = await favoriteRepository.find({
      where: {
        deletedAt: IsNull(),
        viewId: Not(IsNull()),
      },
      select: { id: true, viewId: true },
    });

    const orphanFavoriteIds = favoritesWithViewId
      .filter(
        (favorite) =>
          !isDefined(flatViewMaps.universalIdentifierById[favorite.viewId]),
      )
      .map((favorite) => favorite.id);

    if (orphanFavoriteIds.length === 0) {
      this.logger.log(`No orphan favorites found for workspace ${workspaceId}`);

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${orphanFavoriteIds.length} orphan favorite(s) for workspace ${workspaceId}`,
      );

      return;
    }

    await favoriteRepository.delete(orphanFavoriteIds);

    this.logger.log(
      `Deleted ${orphanFavoriteIds.length} orphan favorite(s) for workspace ${workspaceId}`,
    );
  }
}
