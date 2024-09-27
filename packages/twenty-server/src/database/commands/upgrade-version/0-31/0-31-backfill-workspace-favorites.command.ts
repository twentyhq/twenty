import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'upgrade-0.31:backfill-workspace-favorites-migration',
  description: 'Create a workspace favorite for all workspace views',
})
export class BackfillWorkspaceFavoritesCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to fix migration');

    for (const workspaceId of workspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      try {
        const allWorkspaceIndexViews = await this.getIndexViews(workspaceId);

        const activeWorkspaceIndexViews =
          await this.filterViewsWithoutObjectMetadata(
            workspaceId,
            allWorkspaceIndexViews,
          );

        await this.createViewWorkspaceFavorites(
          workspaceId,
          activeWorkspaceIndexViews.map((view) => view.id),
          _options.dryRun ?? false,
        );

        this.logger.log(
          chalk.green(`Backfilled workspace favorites to ${workspaceId}.`),
        );

        await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
          workspaceId,
        );
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Running command on workspace ${workspaceId} failed with error: ${error}`,
          ),
        );
        continue;
      } finally {
        this.logger.log(
          chalk.green(`Finished running command for workspace ${workspaceId}.`),
        );
      }

      this.logger.log(chalk.green(`Command completed!`));
    }
  }

  private async getIndexViews(
    workspaceId: string,
  ): Promise<ViewWorkspaceEntity[]> {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
        false,
      );

    return viewRepository.find({
      where: {
        key: 'INDEX',
      },
    });
  }

  private async filterViewsWithoutObjectMetadata(
    workspaceId: string,
    views: ViewWorkspaceEntity[],
  ): Promise<ViewWorkspaceEntity[]> {
    const viewObjectMetadataIds = views.map((view) => view.objectMetadataId);

    const objectMetadataEntities = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
        id: In(viewObjectMetadataIds),
      },
    });

    const objectMetadataIds = new Set(
      objectMetadataEntities.map((entity) => entity.id),
    );

    return views.filter((view) => objectMetadataIds.has(view.objectMetadataId));
  }

  private async createViewWorkspaceFavorites(
    workspaceId: string,
    viewIds: string[],
    dryRun: boolean,
  ) {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
      );

    let nextFavoritePosition = await favoriteRepository.count();
    let createdFavorites = 0;

    for (const viewId of viewIds) {
      const existingFavorites = await favoriteRepository.find({
        where: {
          viewId,
        },
      });

      if (existingFavorites.length) {
        continue;
      }

      if (!dryRun) {
        await favoriteRepository.insert(
          favoriteRepository.create({
            viewId,
            position: nextFavoritePosition,
          }),
        );
      }

      createdFavorites++;
      nextFavoritePosition++;
    }

    this.logger.log(
      chalk.green(
        `Found ${createdFavorites} favorites to backfill in workspace ${workspaceId}.`,
      ),
    );
  }
}
