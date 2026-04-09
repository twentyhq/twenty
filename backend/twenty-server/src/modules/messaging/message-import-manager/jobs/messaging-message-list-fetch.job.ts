import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

const toIsoStringOrNull = (
  value: string | Date | null | undefined,
): string | null => {
  if (value == null) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
};

export type MessagingMessageListFetchJobData = {
  messageChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessageListFetchJob {
  constructor(
    private readonly messagingMessageListFetchService: MessagingMessageListFetchService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageChannelDataAccessService: MessageChannelDataAccessService,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  @Process(MessagingMessageListFetchJob.name)
  async handle(data: MessagingMessageListFetchJobData): Promise<void> {
    const { messageChannelId, workspaceId } = data;

    await this.messagingMonitoringService.track({
      eventName: 'message_list_fetch_job.triggered',
      messageChannelId,
      workspaceId,
    });

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannel = await this.messageChannelDataAccessService.findOne(
        workspaceId,
        {
          where: {
            id: messageChannelId,
          },
          relations: ['connectedAccount', 'messageFolders'],
        },
      );

      if (!messageChannel) {
        await this.messagingMonitoringService.track({
          eventName: 'message_list_fetch_job.error.message_channel_not_found',
          messageChannelId,
          workspaceId,
        });

        return;
      }

      if (
        messageChannel.syncStage !==
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED
      ) {
        return;
      }

      try {
        if (
          isThrottled(
            toIsoStringOrNull(messageChannel.syncStageStartedAt),
            messageChannel.throttleFailureCount,
            toIsoStringOrNull(messageChannel.throttleRetryAfter),
          )
        ) {
          await this.messageChannelSyncStatusService.markAsMessagesListFetchPending(
            [messageChannel.id],
            workspaceId,
            true,
          );

          return;
        }

        await this.messagingMonitoringService.track({
          eventName: 'message_list_fetch.started',
          workspaceId,
          connectedAccountId: messageChannel.connectedAccount.id,
          messageChannelId: messageChannel.id,
        });

        await this.messagingMessageListFetchService.processMessageListFetch(
          messageChannel as unknown as MessageChannelWorkspaceEntity,
          workspaceId,
        );

        await this.messagingMonitoringService.track({
          eventName: 'message_list_fetch.completed',
          workspaceId,
          connectedAccountId: messageChannel.connectedAccount.id,
          messageChannelId: messageChannel.id,
        });
      } catch (error) {
        await this.messageImportErrorHandlerService.handleDriverException(
          error,
          MessageImportSyncStep.MESSAGE_LIST_FETCH,
          messageChannel as unknown as MessageChannelWorkspaceEntity,
          workspaceId,
        );
      }
    }, authContext);
  }
}
