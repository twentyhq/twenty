import { Injectable } from '@nestjs/common';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SEND_AGENT_CHAT_WEB_PUSH_NOTIFICATIONS_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-web-push-notifications-job-name.constant';
import { type SendAgentChatWebPushNotificationsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-web-push-notifications-job.types';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { OnDatabaseBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class AgentChatWebPushNotificationListener {
  constructor(
    @InjectMessageQueue(MessageQueue.webPushQueue)
    private readonly webPushQueueService: MessageQueueService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @OnDatabaseBatchEvent('agentChatThread', DatabaseEventAction.UPDATED)
  @OnDatabaseBatchEvent('inboxThread', DatabaseEventAction.UPDATED)
  async handleUpdatedThreads(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<AgentChatThreadWorkspaceEntity>
    >,
  ): Promise<void> {
    const threadActivities = payload.events.flatMap(
      ({ properties: { updatedFields, after: thread } }) =>
        updatedFields.includes('lastActivityAt') &&
        isDefined(thread.lastActivityAt)
          ? [
              {
                threadId: thread.id,
                lastActivityAt: new Date(thread.lastActivityAt).toISOString(),
              },
            ]
          : [],
    );

    if (
      threadActivities.length === 0 ||
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        payload.workspaceId,
      ))
    ) {
      return;
    }

    for (const { threadId, lastActivityAt } of threadActivities) {
      await this.webPushQueueService.add<SendAgentChatWebPushNotificationsJobData>(
        SEND_AGENT_CHAT_WEB_PUSH_NOTIFICATIONS_JOB_NAME,
        { workspaceId: payload.workspaceId, threadId, lastActivityAt },
        {
          deduplication: {
            id: `agent-chat-web-push-${threadId}-${lastActivityAt}`,
          },
          workspaceId: payload.workspaceId,
          isWorkspaceJob: true,
        },
      );
    }
  }
}
