import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateConnectedAccountService } from 'src/engine/core-modules/auth/services/create-connected-account.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { UpdateConnectedAccountOnReconnectService } from 'src/engine/core-modules/auth/services/update-connected-account-on-reconnect.service';
import { getMicrosoftApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-microsoft-apis-oauth-scopes';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import {
  CalendarChannelSyncStage,
  type CalendarChannelVisibility,
  type CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  type MessageChannelVisibility,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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
  ) {}

  async refreshMicrosoftRefreshToken(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    accessToken: string;
    refreshToken: string;
    calendarVisibility: CalendarChannelVisibility | undefined;
    messageVisibility: MessageChannelVisibility | undefined;
  }): Promise<string> {
    const {
      handle,
      workspaceId,
      workspaceMemberId,
      calendarVisibility,
      messageVisibility,
    } = input;

    const scopes = getMicrosoftApisOauthScopes();

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        const connectedAccount = await connectedAccountRepository.findOne({
          where: { handle, accountOwnerId: workspaceMemberId },
        });

        const existingAccountId = connectedAccount?.id;
        const newOrExistingConnectedAccountId = existingAccountId ?? v4();

        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        await workspaceDataSource.transaction(
          async (manager: WorkspaceEntityManager) => {
            if (!existingAccountId) {
              await this.createConnectedAccountService.createConnectedAccount({
                workspaceId,
                connectedAccountId: newOrExistingConnectedAccountId,
                handle,
                provider: ConnectedAccountProvider.MICROSOFT,
                accessToken: input.accessToken,
                refreshToken: input.refreshToken,
                accountOwnerId: workspaceMemberId,
                scopes,
                manager,
              });

              await this.createMessageChannelService.createMessageChannel({
                workspaceId,
                connectedAccountId: newOrExistingConnectedAccountId,
                handle,
                messageVisibility,
                manager,
              });

              if (
                this.twentyConfigService.get(
                  'CALENDAR_PROVIDER_MICROSOFT_ENABLED',
                )
              ) {
                await this.createCalendarChannelService.createCalendarChannel({
                  workspaceId,
                  connectedAccountId: newOrExistingConnectedAccountId,
                  handle,
                  calendarVisibility,
                  manager,
                });
              }
            } else {
              await this.updateConnectedAccountOnReconnectService.updateConnectedAccountOnReconnect(
                {
                  workspaceId,
                  connectedAccountId: newOrExistingConnectedAccountId,
                  accessToken: input.accessToken,
                  refreshToken: input.refreshToken,
                  scopes,
                  connectedAccount,
                  manager,
                },
              );

              const workspaceMemberRepository =
                await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
                  workspaceId,
                  'workspaceMember',
                  { shouldBypassPermissionChecks: true },
                );

              const workspaceMember =
                await workspaceMemberRepository.findOneOrFail({
                  where: { id: workspaceMemberId },
                });

              const userId = workspaceMember.userId;

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
          },
        );

        if (
          this.twentyConfigService.get('MESSAGING_PROVIDER_MICROSOFT_ENABLED')
        ) {
          const messageChannels = await messageChannelRepository.find({
            where: {
              connectedAccountId: newOrExistingConnectedAccountId,
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
          const calendarChannels = await calendarChannelRepository.find({
            where: {
              connectedAccountId: newOrExistingConnectedAccountId,
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
    );
  }
}
