import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Any, Repository } from 'typeorm';

import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';

interface SetMessageDirectionCommandOptions {
  workspaceId?: string;
}

const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE = 10;

@Command({
  name: 'upgrade-0.24:set-message-direction',
  description: 'Set message direction',
})
export class SetMessageDirectionCommand extends CommandRunner {
  private readonly logger = new Logger(SetMessageDirectionCommand.name);
  constructor(
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: SetMessageDirectionCommandOptions,
  ): Promise<void> {
    let activeWorkspaceIds: string[] = [];

    if (options.workspaceId) {
      activeWorkspaceIds = [options.workspaceId];
    } else {
      const activeWorkspaces = await this.workspaceRepository.find({
        where: {
          activationStatus: WorkspaceActivationStatus.ACTIVE,
          ...(options.workspaceId && { id: options.workspaceId }),
        },
      });

      activeWorkspaceIds = activeWorkspaces.map((workspace) => workspace.id);
    }

    if (!activeWorkspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    } else {
      this.logger.log(
        chalk.green(
          `Running command on ${activeWorkspaceIds.length} workspaces`,
        ),
      );
    }

    for (const workspaceId of activeWorkspaceIds) {
      try {
        const messageChannelMessageAssociationRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        const workspaceDataSource =
          await this.twentyORMGlobalManager.getDataSourceForWorkspace(
            workspaceId,
          );

        await workspaceDataSource.transaction(async (transactionManager) => {
          try {
            const messageChannelMessageAssociationCount =
              await messageChannelMessageAssociationRepository.count(
                {},
                transactionManager,
              );

            for (
              let i = 0;
              i < messageChannelMessageAssociationCount;
              i += MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE
            ) {
              const messageChannelMessageAssociationsPage =
                await messageChannelMessageAssociationRepository.find(
                  {
                    where: {
                      message: {
                        messageParticipants: {
                          role: 'from',
                        },
                      },
                    },
                    relations: {
                      message: {
                        messageParticipants: true,
                      },
                      messageChannel: {
                        connectedAccount: true,
                      },
                    },
                    take: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE,
                    skip: i,
                  },
                  transactionManager,
                );

              const { incoming, outgoing } =
                messageChannelMessageAssociationsPage.reduce(
                  (
                    acc: {
                      incoming: string[];
                      outgoing: string[];
                    },
                    messageChannelMessageAssociation,
                  ) => {
                    const connectedAccountHandle =
                      messageChannelMessageAssociation?.messageChannel
                        ?.connectedAccount?.handle;
                    const connectedAccountHandleAliases =
                      messageChannelMessageAssociation?.messageChannel
                        ?.connectedAccount?.handleAliases;
                    const fromHandle =
                      messageChannelMessageAssociation?.message
                        ?.messageParticipants?.[0]?.handle ?? '';

                    if (
                      connectedAccountHandle === fromHandle ||
                      connectedAccountHandleAliases?.includes(fromHandle)
                    ) {
                      acc.outgoing.push(messageChannelMessageAssociation.id);
                    } else {
                      acc.incoming.push(messageChannelMessageAssociation.id);
                    }

                    return acc;
                  },
                  { incoming: [], outgoing: [] },
                );

              await messageChannelMessageAssociationRepository.update(
                {
                  id: Any(incoming),
                },
                {
                  direction: MessageDirection.INCOMING,
                },
                transactionManager,
              );

              await messageChannelMessageAssociationRepository.update(
                {
                  id: Any(outgoing),
                },
                {
                  direction: MessageDirection.OUTGOING,
                },
                transactionManager,
              );

              const numberOfProcessedAssociations =
                i + MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE;

              if (
                numberOfProcessedAssociations %
                  (MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE * 10) ===
                  0 ||
                numberOfProcessedAssociations >=
                  messageChannelMessageAssociationCount
              ) {
                this.logger.log(
                  chalk.green(
                    `Processed ${Math.min(numberOfProcessedAssociations, messageChannelMessageAssociationCount)} of ${messageChannelMessageAssociationCount} message channel message associations`,
                  ),
                );
              }
            }
          } catch (error) {
            this.logger.log(
              chalk.red(`Running command on workspace ${workspaceId} failed`),
            );
            throw error;
          }
        });

        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );

        this.logger.log(
          chalk.green(`Running command on workspace ${workspaceId} done`),
        );
      } catch (error) {
        this.logger.error(
          `Migration failed for workspace ${workspaceId}: ${error.message}`,
        );
      }
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
