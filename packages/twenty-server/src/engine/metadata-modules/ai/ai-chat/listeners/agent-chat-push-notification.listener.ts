import { Injectable } from '@nestjs/common';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  SendAgentChatPushNotificationsJob,
  type SendAgentChatPushNotificationsJobData,
} from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-push-notifications.job';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

// Participant writes of a message (mentions, unread) land just after the activity bump
const PUSH_NOTIFICATION_DELAY_MS = 1_000;

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
      properties: { updatedFields, after: thread },
    } of payload.events) {
      if (
        !updatedFields.includes('lastActivityAt') ||
        !isDefined(thread.lastActivityAt)
      ) {
        continue;
      }

      await this.notificationQueueService.add<SendAgentChatPushNotificationsJobData>(
        SendAgentChatPushNotificationsJob.name,
        { workspaceId: payload.workspaceId, thread },
        {
          id: `push-${thread.id}-${new Date(thread.lastActivityAt).getTime()}`,
          doNotCheckDuplicatesBasedOnPrefix: true,
          delay: PUSH_NOTIFICATION_DELAY_MS,
          workspaceId: payload.workspaceId,
          isWorkspaceJob: true,
        },
      );
    }
  }
}
