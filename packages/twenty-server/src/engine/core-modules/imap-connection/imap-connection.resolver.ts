import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
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
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly imapConnectionService: ImapConnectionService,
    private readonly imapApisService: IMAPAPIsService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  private async checkIfImapFeatureEnabled(workspaceId: string): Promise<void> {
    const isImapEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_IMAP_ENABLED,
      workspaceId,
    );

    if (!isImapEnabled) {
      throw new UserInputError(
        'IMAP feature is not enabled for this workspace',
      );
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async testImapConnection(
    @Args('input') input: TestImapConnectionInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    await this.checkIfImapFeatureEnabled(workspace.id);

    try {
      await this.imapConnectionService.testConnection(input);

      return true;
    } catch (e) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async saveImapConnection(
    @Args('input') input: SaveImapConnectionInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    await this.checkIfImapFeatureEnabled(workspace.id);

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
