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
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'upgrade-0.31:add-index-key-to-tasks-and-notes-views',
  description: 'Add index key to tasks and notes views',
})
export class AddIndexKeyToTasksAndNotesViewsCommand extends ActiveWorkspacesCommandRunner {
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
        this.logger.log(chalk.green(`Cleaning views of ${workspaceId}.`));

        await this.addIndexKeyToTasksAndNotesViews(
          workspaceId,
          _options.dryRun ?? false,
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

  private async addIndexKeyToTasksAndNotesViews(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
        false,
      );

    const allViews = await viewRepository.find();

    const viewObjectMetadataIds = allViews.map((view) => view.objectMetadataId);

    const objectMetadataEntities = await this.objectMetadataRepository.find({
      where: {
        id: In(viewObjectMetadataIds),
      },
    });

    const tasksAndNotesObjectMetadataIds = objectMetadataEntities.filter(
      (entity) =>
        entity.standardId === STANDARD_OBJECT_IDS.task ||
        entity.standardId === STANDARD_OBJECT_IDS.note,
    );

    const viewsToUpdate = allViews.filter(
      (view) =>
        tasksAndNotesObjectMetadataIds.some(
          (entity) => entity.id === view.objectMetadataId,
        ) &&
        ['All Tasks', 'All Notes'].includes(view.name) &&
        view.key === null,
    );

    if (dryRun) {
      this.logger.log(
        chalk.green(
          `Found ${viewsToUpdate.length} views to update in workspace ${workspaceId}.`,
        ),
      );
    }

    if (viewsToUpdate.length > 0 && !dryRun) {
      await viewRepository.update(
        viewsToUpdate.map((view) => view.id),
        {
          key: 'INDEX',
        },
      );
      this.logger.log(chalk.green(`Updating ${viewsToUpdate.length} views.`));
    }

    if (viewsToUpdate.length === 0 && !dryRun) {
      this.logger.log(chalk.green(`No views to update.`));
    }
  }
}
