import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Repository } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { MigrationCommand } from 'src/database/commands/migration-command/decorators/migration-command.decorator';
import {
  MaintainedWorkspacesMigrationCommandOptions,
  MaintainedWorkspacesMigrationCommandRunner,
} from 'src/database/commands/migration-command/maintained-workspaces-migration-command.runner';
import { settings } from 'src/engine/constants/settings';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@MigrationCommand({
  name: 'limit-amount-of-view-field',
  description: 'Limit amount of view field.',
  version: '0.42',
})
export class LimitAmountOfViewFieldCommand extends MaintainedWorkspacesMigrationCommandRunner {
  protected readonly logger: CommandLogger;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
    this.logger = new CommandLogger({
      constructorName: this.constructor.name,
      verbose: false,
    });
    this.logger.setVerbose(false);
  }

  async runOnWorkspace(workspaceId: string, dryRun?: boolean): Promise<void> {
    this.logger.log(
      `Processing workspace ${workspaceId} for view field limitation`,
    );
    try {
      const viewRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          ViewWorkspaceEntity,
        );

      const views = await viewRepository.find({});

      for (const view of views) {
        const viewFieldRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            workspaceId,
            ViewFieldWorkspaceEntity,
          );

        const viewFields = await viewFieldRepository.find({
          where: {
            viewId: view.id,
            isVisible: true,
          },
          order: {
            position: 'ASC',
          },
        });

        if (viewFields.length > settings.maxVisibleViewFields) {
          const extraFields = viewFields.slice(settings.maxVisibleViewFields);

          for (const field of extraFields) {
            this.logger.log(
              `Workspace ${workspaceId} - Hiding field ${field.id} in view ${view.id} (position ${field.position})`,
            );
            if (!dryRun) {
              await viewFieldRepository.update(
                { id: field.id },
                { isVisible: false },
              );
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error limiting view fields in workspace ${workspaceId}`,
        error,
      );
      throw error;
    } finally {
      await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
        workspaceId,
      );
    }
  }

  async runMigrationCommandOnMaintainedWorkspaces(
    _passedParam: string[],
    options: MaintainedWorkspacesMigrationCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(`Running limit-amount-of-view-field command`);

    if (options?.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    for (const [index, workspaceId] of workspaceIds.entries()) {
      try {
        await this.runOnWorkspace(workspaceId, options?.dryRun);
        this.logger.verbose(
          `Processed workspace: ${workspaceId} (${index + 1}/${
            workspaceIds.length
          })`,
        );
      } catch (error) {
        this.logger.error(`Error for workspace: ${workspaceId}`, error);
      }
    }
  }
}
