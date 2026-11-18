import { Injectable } from '@nestjs/common';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AGENT_CHAT_PUSH_NOTIFICATION_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-push-notification-delay-ms.constant';
import { SEND_AGENT_CHAT_PUSH_NOTIFICATIONS_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-push-notifications-job-name.constant';
import { type SendAgentChatPushNotificationsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-push-notifications-job.types';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class AgentChatPushNotificationListener {
  constructor(
    @InjectMessageQueue(MessageQueue.notificationQueue)
    private readonly notificationQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('agentChatThread', DatabaseEventAction.UPDATED)
  async handleUpdatedThreads(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<AgentChatThreadWorkspaceEntity>
    >,
  ): Promise<void> {
    for (const {
      properties: { updatedFields, after },
    } of payload.events) {
      if (
        !updatedFields.includes('lastActivityAt') ||
        !isDefined(after.lastActivityAt)
      ) {
        continue;
      }

      await this.notificationQueueService.add<SendAgentChatPushNotificationsJobData>(
        SEND_AGENT_CHAT_PUSH_NOTIFICATIONS_JOB_NAME,
        {
          workspaceId: payload.workspaceId,
          thread: {
            id: after.id,
            title: after.title,
            conversationType: after.conversationType,
            directMessageFirstWorkspaceMemberId:
              after.directMessageFirstWorkspaceMemberId,
            directMessageSecondWorkspaceMemberId:
              after.directMessageSecondWorkspaceMemberId,
            assigneeId: after.assigneeId,
            lastActivityAt: after.lastActivityAt,
            lastMessageText: after.lastMessageText,
            lastMessageSenderWorkspaceMemberId:
              after.lastMessageSenderWorkspaceMemberId,
            deletedAt: after.deletedAt,
          },
        },
        {
          id: `push-${after.id}-${new Date(after.lastActivityAt).getTime()}`,
          doNotCheckDuplicatesBasedOnPrefix: true,
          delay: AGENT_CHAT_PUSH_NOTIFICATION_DELAY_MS,
          workspaceId: payload.workspaceId,
          isWorkspaceJob: true,
        },
      );
    }
  }
}
