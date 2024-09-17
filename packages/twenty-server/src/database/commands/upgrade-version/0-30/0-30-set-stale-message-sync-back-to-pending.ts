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
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
@Command({
  name: 'upgrade-0.30:set-stale-message-sync-back-to-pending',
  description: 'Set stale message sync back to pending',
})
export class SetStaleMessageSyncBackToPendingCommand extends ActiveWorkspacesCommandRunner {
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
    this.logger.log(
      'Running command to set stale message sync back to pending',
    );

    for (const workspaceId of workspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      try {
        const dataSource =
          await this.twentyORMGlobalManager.getDataSourceForWorkspace(
            workspaceId,
          );

        const messageChannelRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        dataSource.transaction(async (entityManager) => {
          await messageChannelRepository.update(
            {
              syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
              syncStageStartedAt: IsNull(),
            },
            {
              syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
            },
            entityManager,
          );

          await messageChannelRepository.update(
            {
              syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
              syncStageStartedAt: IsNull(),
            },
            {
              syncStage:
                MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
            },
            entityManager,
          );
        });
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Running command on workspace ${workspaceId} failed with error: ${error}`,
          ),
        );
        continue;
      }

      this.logger.log(chalk.green(`Command completed!`));
    }
  }
}
