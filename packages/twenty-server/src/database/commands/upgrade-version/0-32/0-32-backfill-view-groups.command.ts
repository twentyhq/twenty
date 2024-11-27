import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'upgrade-0.32:backfill-view-groups',
  description: 'Backfill view groups',
})
export class BackfillViewGroupsCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to fix backfill view groups');

    for (const workspaceId of workspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      try {
        const viewRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
            workspaceId,
            'view',
          );

        const viewGroupRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewGroupWorkspaceEntity>(
            workspaceId,
            'viewGroup',
          );

        const kanbanViews = await viewRepository.find({
          where: {
            type: 'kanban',
          },
        });

        const kanbanFieldMetadataIds = kanbanViews.map(
          (view) => view.kanbanFieldMetadataId,
        );

        const kanbanFieldMetadataItems =
          await this.fieldMetadataRepository.find({
            where: {
              id: In(kanbanFieldMetadataIds),
            },
          });

        for (const kanbanView of kanbanViews) {
          const kanbanFieldMetadataItem = kanbanFieldMetadataItems.find(
            (item) => item.id === kanbanView.kanbanFieldMetadataId,
          );

          if (!kanbanFieldMetadataItem) {
            this.logger.log(
              chalk.red(
                `Kanban field metadata with id ${kanbanView.kanbanFieldMetadataId} not found`,
              ),
            );
            continue;
          }

          for (const option of kanbanFieldMetadataItem.options) {
            const viewGroup = await viewGroupRepository.findOne({
              where: {
                fieldMetadataId: kanbanFieldMetadataItem.id,
                fieldValue: option.value,
                viewId: kanbanView.id,
              },
            });

            if (viewGroup) {
              this.logger.log(
                chalk.red(`View group with id ${option.value} already exists`),
              );
              continue;
            }

            await viewGroupRepository.save({
              fieldMetadataId: kanbanFieldMetadataItem.id,
              fieldValue: option.value,
              isVisible: true,
              viewId: kanbanView.id,
              position: option.position,
            });
          }
        }
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
}
