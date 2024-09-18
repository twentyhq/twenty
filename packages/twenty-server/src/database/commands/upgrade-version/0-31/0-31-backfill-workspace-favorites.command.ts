import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
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
        const workspaceIndexViews = await this.getIndexViews(workspaceId);

        await this.createViewWorkspaceFavorites(
          workspaceId,
          workspaceIndexViews.map((view) => view.id),
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

  private async createViewWorkspaceFavorites(
    workspaceId: string,
    viewIds: string[],
  ) {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
      );

    let nextFavoritePosition = await favoriteRepository.count();

    for (const viewId of viewIds) {
      const existingFavorites = await favoriteRepository.find({
        where: {
          viewId,
        },
      });

      if (existingFavorites.length) {
        continue;
      }

      await favoriteRepository.insert(
        favoriteRepository.create({
          viewId,
          position: nextFavoritePosition,
        }),
      );

      nextFavoritePosition++;
    }
  }
}
