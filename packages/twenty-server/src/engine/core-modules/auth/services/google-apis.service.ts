import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import {
  ConnectedAccountWorkspaceEntity,
  ConnectedAccountProvider,
} from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import {
  MessageChannelWorkspaceEntity,
  MessageChannelType,
  MessageChannelVisibility,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import {
  CalendarChannelWorkspaceEntity,
  CalendarChannelVisibility,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import {
  CalendarEventsImportJobData,
  CalendarEventListFetchJob,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';

@Injectable()
export class GoogleAPIsService {
  constructor(
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly environmentService: EnvironmentService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
  ) {}

  async refreshGoogleRefreshToken(input: {
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

    const isCalendarEnabled = this.environmentService.get(
      'CALENDAR_PROVIDER_GOOGLE_ENABLED',
    );

    const connectedAccounts =
      await this.connectedAccountRepository.getAllByHandleAndWorkspaceMemberId(
        handle,
        workspaceMemberId,
        workspaceId,
      );

    const existingAccountId = connectedAccounts?.[0]?.id;
    const newOrExistingConnectedAccountId = existingAccountId ?? v4();

    await this.workspaceDataSource.transaction(
      async (manager: EntityManager) => {
        if (!existingAccountId) {
          await this.connectedAccountRepository.create(
            {
              id: newOrExistingConnectedAccountId,
              handle,
              provider: ConnectedAccountProvider.GOOGLE,
              accessToken: input.accessToken,
              refreshToken: input.refreshToken,
              accountOwnerId: workspaceMemberId,
            },
            workspaceId,
            manager,
          );

          await this.messageChannelRepository.create(
            {
              id: v4(),
              connectedAccountId: newOrExistingConnectedAccountId,
              type: MessageChannelType.EMAIL,
              handle,
              visibility:
                messageVisibility || MessageChannelVisibility.SHARE_EVERYTHING,
              syncStatus: MessageChannelSyncStatus.ONGOING,
            },
            workspaceId,
            manager,
          );

          if (isCalendarEnabled) {
            await this.calendarChannelRepository.save(
              {
                id: v4(),
                connectedAccountId: newOrExistingConnectedAccountId,
                handle,
                visibility:
                  calendarVisibility ||
                  CalendarChannelVisibility.SHARE_EVERYTHING,
              },
              {},
              manager,
            );
          }
        } else {
          await this.connectedAccountRepository.updateAccessTokenAndRefreshToken(
            input.accessToken,
            input.refreshToken,
            newOrExistingConnectedAccountId,
            workspaceId,
            manager,
          );

          await this.messageChannelRepository.resetSync(
            newOrExistingConnectedAccountId,
            workspaceId,
            manager,
          );
        }
      },
    );

    if (this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED')) {
      const messageChannels =
        await this.messageChannelRepository.getByConnectedAccountId(
          newOrExistingConnectedAccountId,
          workspaceId,
        );

      for (const messageChannel of messageChannels) {
        await this.messageQueueService.add<MessagingMessageListFetchJobData>(
          MessagingMessageListFetchJob.name,
          {
            workspaceId,
            messageChannelId: messageChannel.id,
          },
        );
      }
    }

    if (isCalendarEnabled) {
      const calendarChannels = await this.calendarChannelRepository.find({
        where: {
          connectedAccountId: newOrExistingConnectedAccountId,
        },
      });

      for (const calendarChannel of calendarChannels) {
        await this.calendarQueueService.add<CalendarEventsImportJobData>(
          CalendarEventListFetchJob.name,
          {
            calendarChannelId: calendarChannel.id,
            workspaceId,
          },
        );
      }
    }
  }
}
