import chalk from 'chalk';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesMigrationCommandOptions,
  ActiveWorkspacesMigrationCommandRunner,
} from 'src/database/commands/migration-command/active-workspaces-migration-command.runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export abstract class BatchActiveWorkspacesMigrationCommandRunner<
  Options extends
    ActiveWorkspacesMigrationCommandOptions = ActiveWorkspacesMigrationCommandOptions,
> extends ActiveWorkspacesMigrationCommandRunner<Options> {
  constructor(
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  async runMigrationCommandOnActiveWorkspaces(
    _passedParams: string[],
    _options: Options,
    activeWorkspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      chalk.green(`Running command on ${activeWorkspaceIds.length} workspaces`),
    );
    for (const [index, workspaceId] of activeWorkspaceIds.entries()) {
      this.logger.log(
        chalk.green(
          `Processing workspace ${workspaceId} (${index + 1}/${
            activeWorkspaceIds.length
          })`,
        ),
      );

      const dataSource =
        await this.twentyORMGlobalManager.getDataSourceForWorkspace(
          workspaceId,
          false,
        );

      try {
        await this.runMigrationCommandOnWorkspace(
          workspaceId,
          index,
          activeWorkspaceIds.length,
          dataSource,
        );
      } catch (error) {
        this.logger.error(`Error in workspace ${workspaceId}: ${error}`);
      }
      await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
        workspaceId,
      );
    }
  }

  protected abstract runMigrationCommandOnWorkspace(
    workspaceId: string,
    index: number,
    total: number,
    dataSource: WorkspaceDataSource,
  ): Promise<void>;
}
