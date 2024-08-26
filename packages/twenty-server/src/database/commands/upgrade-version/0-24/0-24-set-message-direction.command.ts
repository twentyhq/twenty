import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Any, Repository } from 'typeorm';

import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';

interface SetMessageDirectionCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.24:migrate-message-direction',
  description: 'Migrate message direction',
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

        const messageChannelMessageAssociations =
          await messageChannelMessageAssociationRepository.find({
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
          });

        try {
          const { incoming, outgoing } =
            messageChannelMessageAssociations.reduce(
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
                const connectedAccountHanldeAliases =
                  messageChannelMessageAssociation?.messageChannel
                    ?.connectedAccount?.handleAliases;
                const fromHandle =
                  messageChannelMessageAssociation?.message
                    ?.messageParticipants?.[0]?.handle ?? '';

                if (
                  connectedAccountHandle === fromHandle ||
                  connectedAccountHanldeAliases?.includes(fromHandle)
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
              direction: 'incoming',
            },
          );

          await messageChannelMessageAssociationRepository.update(
            {
              id: Any(outgoing),
            },
            {
              direction: 'outgoing',
            },
          );
        } catch (error) {
          this.logger.log(
            chalk.red(`Running command on workspace ${workspaceId} failed`),
          );
          throw error;
        }

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
