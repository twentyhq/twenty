import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { getMicrosoftApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-microsoft-apis-oauth-scopes';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CalendarEventListFetchJob,
  CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import {
  CalendarChannelVisibility,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import {
  ConnectedAccountProvider,
  ConnectedAccountWorkspaceEntity,
} from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class MicrosoftAPIsService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  async refreshMicrosoftRefreshToken(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    accessToken: string;
    refreshToken: string;
    calendarVisibility: CalendarChannelVisibility | undefined;
    messageVisibility: MessageChannelVisibility | undefined;
  }) {
    const {
      handle,
      workspaceId,
      workspaceMemberId,
      calendarVisibility,
      messageVisibility,
    } = input;

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { handle, accountOwnerId: workspaceMemberId },
    });

    const existingAccountId = connectedAccount?.id;
    const newOrExistingConnectedAccountId = existingAccountId ?? v4();

    const calendarChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarChannelWorkspaceEntity>(
        workspaceId,
        'calendarChannel',
      );

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(workspaceId);

    const scopes = getMicrosoftApisOauthScopes();

    await workspaceDataSource.transaction(async (manager: EntityManager) => {
      if (!existingAccountId) {
        await connectedAccountRepository.save(
          {
            id: newOrExistingConnectedAccountId,
            handle,
            provider: ConnectedAccountProvider.MICROSOFT,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            accountOwnerId: workspaceMemberId,
            scopes,
          },
          {},
          manager,
        );

        await messageChannelRepository.save(
          {
            id: v4(),
            connectedAccountId: newOrExistingConnectedAccountId,
            type: MessageChannelType.EMAIL,
            handle,
            visibility:
              messageVisibility || MessageChannelVisibility.SHARE_EVERYTHING,
            syncStatus: MessageChannelSyncStatus.ONGOING,
          },
          {},
          manager,
        );

        await calendarChannelRepository.save(
          {
            id: v4(),
            connectedAccountId: newOrExistingConnectedAccountId,
            handle,
            visibility:
              calendarVisibility || CalendarChannelVisibility.SHARE_EVERYTHING,
          },
          {},
          manager,
        );
      } else {
        await connectedAccountRepository.update(
          {
            id: newOrExistingConnectedAccountId,
          },
          {
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            scopes,
          },
          manager,
        );

        const workspaceMemberRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
          );

        const workspaceMember = await workspaceMemberRepository.findOneOrFail({
          where: { id: workspaceMemberId },
        });

        const userId = workspaceMember.userId;

        await this.accountsToReconnectService.removeAccountToReconnect(
          userId,
          workspaceId,
          newOrExistingConnectedAccountId,
        );

        await messageChannelRepository.update(
          {
            connectedAccountId: newOrExistingConnectedAccountId,
          },
          {
            syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
            syncStatus: MessageChannelSyncStatus.ONGOING,
            syncCursor: '',
            syncStageStartedAt: null,
          },
          manager,
        );
      }
    });

    const messageChannels = await messageChannelRepository.find({
      where: {
        connectedAccountId: newOrExistingConnectedAccountId,
      },
    });

    for (const messageChannel of messageChannels) {
      await this.messageQueueService.add<MessagingMessageListFetchJobData>(
        MessagingMessageListFetchJob.name,
        {
          workspaceId,
          messageChannelId: messageChannel.id,
        },
      );
    }

    const calendarChannels = await calendarChannelRepository.find({
      where: {
        connectedAccountId: newOrExistingConnectedAccountId,
      },
    });

    for (const calendarChannel of calendarChannels) {
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
