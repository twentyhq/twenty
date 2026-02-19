import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 } from 'uuid';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateConnectedAccountService } from 'src/engine/core-modules/auth/services/create-connected-account.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { GoogleAPIScopesService } from 'src/engine/core-modules/auth/services/google-apis-scopes';
import { GoogleApisServiceAvailabilityService } from 'src/engine/core-modules/auth/services/google-apis-service-availability.service';
import { UpdateConnectedAccountOnReconnectService } from 'src/engine/core-modules/auth/services/update-connected-account-on-reconnect.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
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
  MessageChannelSyncStatus,
  type MessageChannelVisibility,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class GoogleAPIsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    private readonly createMessageChannelService: CreateMessageChannelService,
    private readonly messagingChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly createCalendarChannelService: CreateCalendarChannelService,
    private readonly createConnectedAccountService: CreateConnectedAccountService,
    private readonly updateConnectedAccountOnReconnectService: UpdateConnectedAccountOnReconnectService,
    private readonly googleAPIScopesService: GoogleAPIScopesService,
    private readonly googleApisServiceAvailabilityService: GoogleApisServiceAvailabilityService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async refreshGoogleRefreshToken(input: {
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

    const isCalendarEnabled = this.twentyConfigService.get(
      'CALENDAR_PROVIDER_GOOGLE_ENABLED',
    );

    const isMessagingEnabled = this.twentyConfigService.get(
      'MESSAGING_PROVIDER_GMAIL_ENABLED',
    );

    const isDraftEmailEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_DRAFT_EMAIL_ENABLED,
      workspaceId,
    );

    const { scopes, isValid } =
      await this.googleAPIScopesService.getScopesFromGoogleAccessTokenAndCheckIfExpectedScopesArePresent(
        input.accessToken,
        isDraftEmailEnabled,
      );

    if (!isValid) {
      throw new AuthException(
        'Unable to connect: Please ensure all permissions are granted',
        AuthExceptionCode.INSUFFICIENT_SCOPES,
      );
    }

    const { isMessagingAvailable, isCalendarAvailable } =
      await this.googleApisServiceAvailabilityService.checkServicesAvailability(
        input.accessToken,
      );

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
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
                provider: ConnectedAccountProvider.GOOGLE,
                accessToken: input.accessToken,
                refreshToken: input.refreshToken,
                accountOwnerId: workspaceMemberId,
                scopes,
                manager,
              });

              if (isMessagingEnabled && isMessagingAvailable) {
                await this.createMessageChannelService.createMessageChannel({
                  workspaceId,
                  connectedAccountId: newOrExistingConnectedAccountId,
                  handle,
                  messageVisibility,
                  manager,
                  skipMessageChannelConfiguration,
                });
              }

              if (isCalendarEnabled && isCalendarAvailable) {
                await this.createCalendarChannelService.createCalendarChannel({
                  workspaceId,
                  connectedAccountId: newOrExistingConnectedAccountId,
                  handle,
                  calendarVisibility,
                  manager,
                  skipMessageChannelConfiguration,
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
            }
          },
        );

        if (isMessagingEnabled) {
          const messageChannels = await messageChannelRepository.find({
            where: { connectedAccountId: newOrExistingConnectedAccountId },
          });

          if (!isMessagingAvailable && messageChannels.length > 0) {
            await this.messagingChannelSyncStatusService.markAsFailed(
              messageChannels.map((channel) => channel.id),
              workspaceId,
              MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
            );
          }

          if (isMessagingAvailable) {
            for (const messageChannel of messageChannels) {
              if (
                messageChannel.syncStage !==
                MessageChannelSyncStage.PENDING_CONFIGURATION
              ) {
                await this.messagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending(
                  [messageChannel.id],
                  workspaceId,
                );
                await this.messageQueueService.add<MessagingMessageListFetchJobData>(
                  MessagingMessageListFetchJob.name,
                  { workspaceId, messageChannelId: messageChannel.id },
                );
              }
            }
          }
        }

        if (isCalendarEnabled) {
          const calendarChannels = await calendarChannelRepository.find({
            where: { connectedAccountId: newOrExistingConnectedAccountId },
          });

          if (!isCalendarAvailable && calendarChannels.length > 0) {
            await this.calendarChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushCalendarEventsToImport(
              calendarChannels.map((channel) => channel.id),
              workspaceId,
            );
          }

          if (isCalendarAvailable) {
            for (const calendarChannel of calendarChannels) {
              if (
                calendarChannel.syncStage !==
                CalendarChannelSyncStage.PENDING_CONFIGURATION
              ) {
                await this.calendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending(
                  [calendarChannel.id],
                  workspaceId,
                );
                await this.calendarQueueService.add<CalendarEventListFetchJobData>(
                  CalendarEventListFetchJob.name,
                  { workspaceId, calendarChannelId: calendarChannel.id },
                );
              }
            }
          }
        }

        return newOrExistingConnectedAccountId;
      },
      authContext,
    );
  }
}
