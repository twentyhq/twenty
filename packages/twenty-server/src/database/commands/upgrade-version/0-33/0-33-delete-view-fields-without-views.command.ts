import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { IsNull, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

interface DeleteViewFieldsWithoutViewsCommandOptions
  extends ActiveWorkspacesCommandOptions {}

@Command({
  name: 'upgrade-0.33:delete-view-fields-without-views',
  description: 'Delete ViewFields that do not have a View',
})
export class DeleteViewFieldsWithoutViewsCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: DeleteViewFieldsWithoutViewsCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to delete ViewFields that do not have a View',
    );

    for (const workspaceId of workspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      try {
        await this.deleteViewFieldsWithoutViewsForWorkspace(
          workspaceId,
          options,
        );
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Running command on workspace ${workspaceId} failed with error: ${error}, ${error.stack}`,
          ),
        );
        continue;
      } finally {
        this.logger.log(
          chalk.green(`Finished running command for workspace ${workspaceId}.`),
        );
      }
    }

    this.logger.log(chalk.green(`Command completed!`));
  }

  private async deleteViewFieldsWithoutViewsForWorkspace(
    workspaceId: string,
    options: DeleteViewFieldsWithoutViewsCommandOptions,
  ): Promise<void> {
    const viewFieldRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'viewField',
        false,
      );

    const viewFieldsWithoutViews = await viewFieldRepository.find({
      where: {
        viewId: IsNull(),
      },
    });

    const viewFieldIds = viewFieldsWithoutViews.map((vf) => vf.id);

    if (!options.dryRun && viewFieldIds.length > 0) {
      await viewFieldRepository.delete(viewFieldIds);
    }

    if (options.verbose) {
      this.logger.log(
        chalk.yellow(
          `Deleted ${viewFieldsWithoutViews.length} ViewFields that do not have a View`,
        ),
      );
    }
  }
}
