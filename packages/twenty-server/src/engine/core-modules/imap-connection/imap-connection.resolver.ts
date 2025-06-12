import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import {
  SaveImapConnectionInput,
  TestImapConnectionInput,
} from 'src/engine/core-modules/imap-connection/dtos/imap-connection.dto';
import { ImapConnectionService } from 'src/engine/core-modules/imap-connection/services/imap-connection.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { GraphqlValidationExceptionFilter } from 'src/filters/graphql-validation-exception.filter';
import { IMAPAPIsService } from 'src/modules/connected-account/services/imap-apis.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

@Resolver()
@UseFilters(
  GraphqlValidationExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class ImapConnectionResolver {
  constructor(
    private readonly imapConnectionService: ImapConnectionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly imapApisService: IMAPAPIsService,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async testImapConnection(
    @Args('input') input: TestImapConnectionInput,
  ): Promise<boolean> {
    return await this.imapConnectionService.testConnection({
      host: input.host,
      port: input.port,
      secure: input.secure,
      username: input.username,
      password: input.password,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async saveImapConnection(
    @Args('input') input: SaveImapConnectionInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const {
      id,
      accountOwnerId,
      handle,
      host,
      port,
      secure,
      password,
      messageVisibility,
    } = input;

    const connectionParams = this.imapConnectionService.formatConnectionParams({
      host,
      port,
      secure,
      password,
    });

    if (id) {
      const connectedAccountRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
          workspace.id,
          'connectedAccount',
        );

      await connectedAccountRepository.update(
        { id },
        {
          handle,
          provider: ConnectedAccountProvider.IMAP,
          connectionType: 'IMAP',
          customConnectionParams: connectionParams as object,
        },
      );

      const messageChannelRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
          workspace.id,
          'messageChannel',
        );

      const messageChannels = await messageChannelRepository.find({
        where: { connectedAccountId: id },
      });

      if (messageChannels.length > 0) {
        await messageChannelRepository.update(
          { connectedAccountId: id },
          {
            syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
            syncStatus: null,
            syncCursor: '',
            syncStageStartedAt: null,
          },
        );

        if (this.twentyConfigService.get('MESSAGING_PROVIDER_IMAP_ENABLED')) {
          for (const messageChannel of messageChannels) {
            await this.messageQueueService.add<MessagingMessageListFetchJobData>(
              MessagingMessageListFetchJob.name,
              {
                workspaceId: workspace.id,
                messageChannelId: messageChannel.id,
              },
            );
          }
        }
      }
    } else {
      await this.imapApisService.setupIMAPAccount({
        handle,
        workspaceMemberId: accountOwnerId,
        workspaceId: workspace.id,
        imapServer: connectionParams.imapServer as string,
        imapPort: connectionParams.imapPort as number,
        imapEncryption: connectionParams.imapEncryption as string,
        imapPassword: connectionParams.imapPassword as string,
        messageVisibility,
      });
    }

    return true;
  }
}
