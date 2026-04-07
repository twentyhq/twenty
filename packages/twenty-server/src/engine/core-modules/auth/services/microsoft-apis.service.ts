import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  CalendarChannelSyncStage,
  type CalendarChannelVisibility,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  type MessageChannelVisibility,
} from 'twenty-shared/types';
import { v4 } from 'uuid';
import { EntityManager, Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateConnectedAccountService } from 'src/engine/core-modules/auth/services/create-connected-account.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { UpdateConnectedAccountOnReconnectService } from 'src/engine/core-modules/auth/services/update-connected-account-on-reconnect.service';
import { getMicrosoftApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-microsoft-apis-oauth-scopes';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class MicrosoftAPIsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    private readonly messagingChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly createMessageChannelService: CreateMessageChannelService,
    private readonly createCalendarChannelService: CreateCalendarChannelService,
    private readonly createConnectedAccountService: CreateConnectedAccountService,
    private readonly updateConnectedAccountOnReconnectService: UpdateConnectedAccountOnReconnectService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly syncMessageFoldersService: SyncMessageFoldersService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  async refreshMicrosoftRefreshToken(input: {
    handle: string;
    userId: string;
    workspaceMemberId: string;
    workspaceId: string;
    accessToken: string;
    refreshToken: string;
    calendarVisibility: CalendarChannelVisibility | undefined;
    messageVisibility: MessageChannelVisibility | undefined;
    skipMessageChannelConfiguration?: boolean;
  }): Promise<string> {
    const {
      handle,
      workspaceId,
      userId,
      workspaceMemberId,
      calendarVisibility,
      messageVisibility,
      skipMessageChannelConfiguration,
    } = input;

    const scopes = getMicrosoftApisOauthScopes();

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const userWorkspace = await this.userWorkspaceRepository.findOne({
          where: { userId, workspaceId },
        });

        if (!isDefined(userWorkspace)) {
          throw new AuthException(
            `User workspace not found for user ${userId} in workspace ${workspaceId}`,
            AuthExceptionCode.INVALID_INPUT,
          );
        }

        const userWorkspaceId = userWorkspace.id;

        const connectedAccount = await this.connectedAccountRepository.findOne({
          where: {
            handle,
            userWorkspaceId: userWorkspaceId,
            workspaceId,
          },
        });

        const existingAccountId = connectedAccount?.id;
        const newOrExistingConnectedAccountId = existingAccountId ?? v4();

        const existingMessageChannels =
          await this.messageChannelRepository.find({
            where: {
              connectedAccountId: newOrExistingConnectedAccountId,
              workspaceId,
            },
          });

        const existingCalendarChannels =
          await this.calendarChannelRepository.find({
            where: {
              connectedAccountId: newOrExistingConnectedAccountId,
              workspaceId,
            },
          });

        await this.messageChannelRepository.manager.transaction(
          async (transactionManager: EntityManager) => {
            await this.createConnectedAccountService.createConnectedAccount({
              workspaceId,
              connectedAccountId: newOrExistingConnectedAccountId,
              handle,
              provider: ConnectedAccountProvider.MICROSOFT,
              accessToken: input.accessToken,
              refreshToken: input.refreshToken,
              accountOwnerId: workspaceMemberId,
              scopes,
              transactionManager,
            });

            if (existingAccountId) {
              await this.updateConnectedAccountOnReconnectService.updateConnectedAccountOnReconnect(
                {
                  workspaceId,
                  connectedAccountId: newOrExistingConnectedAccountId,
                  accessToken: input.accessToken,
                  refreshToken: input.refreshToken,
                  scopes,
                  transactionManager,
                },
              );

              await this.accountsToReconnectService.removeAccountToReconnect(
                userId,
                workspaceId,
                newOrExistingConnectedAccountId,
              );

              await this.messagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending(
                [newOrExistingConnectedAccountId],
                workspaceId,
              );

              await this.calendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending(
                [newOrExistingConnectedAccountId],
                workspaceId,
              );
            }

            if (
              this.twentyConfigService.get(
                'MESSAGING_PROVIDER_MICROSOFT_ENABLED',
              ) &&
              existingMessageChannels.length === 0
            ) {
              await this.createMessageChannelService.createMessageChannel({
                workspaceId,
                connectedAccountId: newOrExistingConnectedAccountId,
                handle,
                messageVisibility,
                skipMessageChannelConfiguration,
                transactionManager,
              });
            }

            if (
              this.twentyConfigService.get(
                'CALENDAR_PROVIDER_MICROSOFT_ENABLED',
              ) &&
              existingCalendarChannels.length === 0
            ) {
              await this.createCalendarChannelService.createCalendarChannel({
                workspaceId,
                connectedAccountId: newOrExistingConnectedAccountId,
                handle,
                calendarVisibility,
                skipMessageChannelConfiguration,
                transactionManager,
              });
            }
          },
        );

        if (
          this.twentyConfigService.get(
            'MESSAGING_PROVIDER_MICROSOFT_ENABLED',
          ) &&
          existingMessageChannels.length === 0
        ) {
          const newMessageChannel = await this.messageChannelRepository.findOne(
            {
              where: {
                connectedAccountId: newOrExistingConnectedAccountId,
                workspaceId,
              },
              relations: ['connectedAccount', 'messageFolders'],
            },
          );

          if (isDefined(newMessageChannel)) {
            await this.syncMessageFoldersService.syncMessageFolders({
              messageChannel: newMessageChannel,
              workspaceId,
            });
          }
        }

        if (
          this.twentyConfigService.get('MESSAGING_PROVIDER_MICROSOFT_ENABLED')
        ) {
          const messageChannels = await this.messageChannelRepository.find({
            where: {
              connectedAccountId: newOrExistingConnectedAccountId,
              workspaceId,
            },
          });

          for (const messageChannel of messageChannels) {
            if (
              messageChannel.syncStage !==
              MessageChannelSyncStage.PENDING_CONFIGURATION
            ) {
              await this.messageQueueService.add<MessagingMessageListFetchJobData>(
                MessagingMessageListFetchJob.name,
                {
                  workspaceId,
                  messageChannelId: messageChannel.id,
                },
              );
            }
          }
        }

        if (
          this.twentyConfigService.get('CALENDAR_PROVIDER_MICROSOFT_ENABLED')
        ) {
          const calendarChannels = await this.calendarChannelRepository.find({
            where: {
              connectedAccountId: newOrExistingConnectedAccountId,
              workspaceId,
            },
          });

          for (const calendarChannel of calendarChannels) {
            if (
              calendarChannel.syncStage !==
              CalendarChannelSyncStage.PENDING_CONFIGURATION
            ) {
              await this.calendarQueueService.add<CalendarEventListFetchJobData>(
                CalendarEventListFetchJob.name,
                {
                  calendarChannelId: calendarChannel.id,
                  workspaceId,
                },
              );
            }
          }
        }

        return newOrExistingConnectedAccountId;
      },
      authContext,
    );
  }
}
