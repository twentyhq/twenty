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
import { CalendarChannelDataAccessService } from 'src/engine/metadata-modules/calendar-channel/data-access/services/calendar-channel-data-access.service';
import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
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
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  type MessageChannelVisibility,
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
    private readonly connectedAccountDataAccessService: ConnectedAccountDataAccessService,
    private readonly messageChannelDataAccessService: MessageChannelDataAccessService,
    private readonly calendarChannelDataAccessService: CalendarChannelDataAccessService,
  ) {}

  async refreshMicrosoftRefreshToken(input: {
    handle: string;
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
      workspaceMemberId,
      calendarVisibility,
      messageVisibility,
      skipMessageChannelConfiguration,
    } = input;

    const scopes = getMicrosoftApisOauthScopes();

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const connectedAccount =
          await this.connectedAccountDataAccessService.findOne(workspaceId, {
            where: { handle, accountOwnerId: workspaceMemberId },
          });

        const existingAccountId = connectedAccount?.id;
        const newOrExistingConnectedAccountId = existingAccountId ?? v4();

        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        await workspaceDataSource.transaction(
          async (manager: WorkspaceEntityManager) => {
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

            if (existingAccountId) {
              await this.updateConnectedAccountOnReconnectService.updateConnectedAccountOnReconnect(
                {
                  workspaceId,
                  connectedAccountId: newOrExistingConnectedAccountId,
                  accessToken: input.accessToken,
                  refreshToken: input.refreshToken,
                  scopes,
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

            const existingMessageChannels =
              await this.messageChannelDataAccessService.find(workspaceId, {
                connectedAccountId: newOrExistingConnectedAccountId,
              });

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
                manager,
                skipMessageChannelConfiguration,
              });
            }

            const existingCalendarChannels =
              await this.calendarChannelDataAccessService.find(workspaceId, {
                where: {
                  connectedAccountId: newOrExistingConnectedAccountId,
                },
              });

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
                manager,
                skipMessageChannelConfiguration,
              });
            }
          },
        );

        if (
          this.twentyConfigService.get('MESSAGING_PROVIDER_MICROSOFT_ENABLED')
        ) {
          const messageChannels =
            await this.messageChannelDataAccessService.find(workspaceId, {
              connectedAccountId: newOrExistingConnectedAccountId,
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
          const calendarChannels =
            await this.calendarChannelDataAccessService.find(workspaceId, {
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
      authContext,
    );
  }
}
