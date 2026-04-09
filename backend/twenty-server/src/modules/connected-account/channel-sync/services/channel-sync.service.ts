import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarChannelDataAccessService } from 'src/engine/metadata-modules/calendar-channel/data-access/services/calendar-channel-data-access.service';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

export type StartChannelSyncInput = {
  connectedAccountId: string;
  workspaceId: string;
};

@Injectable()
export class ChannelSyncService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly messageChannelDataAccessService: MessageChannelDataAccessService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly calendarChannelDataAccessService: CalendarChannelDataAccessService,
  ) {}

  async startChannelSync(input: StartChannelSyncInput): Promise<void> {
    const { connectedAccountId, workspaceId } = input;

    await this.startMessageChannelSync(connectedAccountId, workspaceId);
    await this.startCalendarChannelSync(connectedAccountId, workspaceId);
  }

  private async startMessageChannelSync(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannels = await this.messageChannelDataAccessService.find(
        workspaceId,
        {
          connectedAccountId,
          syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
        },
      );

      for (const messageChannel of messageChannels) {
        await this.messageChannelSyncStatusService.markAsMessagesListFetchScheduled(
          [messageChannel.id],
          workspaceId,
        );

        await this.messageQueueService.add<MessagingMessageListFetchJobData>(
          MessagingMessageListFetchJob.name,
          {
            workspaceId,
            messageChannelId: messageChannel.id,
          },
        );
      }
    }, authContext);
  }

  private async startCalendarChannelSync(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarChannels = await this.calendarChannelDataAccessService.find(
        workspaceId,
        {
          where: {
            connectedAccountId,
            syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
          },
        },
      );

      for (const calendarChannel of calendarChannels) {
        await this.calendarChannelDataAccessService.update(
          workspaceId,
          { id: calendarChannel.id },
          {
            syncStage:
              CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
            syncStatus: CalendarChannelSyncStatus.ONGOING,
          },
        );

        await this.calendarQueueService.add<CalendarEventListFetchJobData>(
          CalendarEventListFetchJob.name,
          {
            workspaceId,
            calendarChannelId: calendarChannel.id,
          },
        );
      }
    }, authContext);
  }
}
