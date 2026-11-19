import { Injectable } from '@nestjs/common';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  SendAgentChatPushNotificationsJob,
  type SendAgentChatPushNotificationsJobData,
} from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-push-notifications.job';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class AgentChatPushNotificationListener {
  constructor(
    @InjectMessageQueue(MessageQueue.pushNotificationQueue)
    private readonly pushNotificationQueueService: MessageQueueService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @OnDatabaseBatchEvent('agentChatThread', DatabaseEventAction.UPDATED)
  async handleUpdatedThreads(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<AgentChatThreadWorkspaceEntity>
    >,
  ): Promise<void> {
    const threadActivities = payload.events.flatMap(
      ({ properties: { updatedFields, after: thread } }) =>
        updatedFields.includes('lastActivityAt') &&
        isDefined(thread.lastActivityAt)
          ? [{ thread, lastActivityAt: thread.lastActivityAt }]
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

    for (const { thread, lastActivityAt } of threadActivities) {
      await this.pushNotificationQueueService.add<SendAgentChatPushNotificationsJobData>(
        SendAgentChatPushNotificationsJob.name,
        { workspaceId: payload.workspaceId, thread },
        {
          id: `push-${thread.id}-${new Date(lastActivityAt).getTime()}`,
          doNotCheckDuplicatesBasedOnPrefix: true,
          workspaceId: payload.workspaceId,
          isWorkspaceJob: true,
        },
      );
    }
  }
}
