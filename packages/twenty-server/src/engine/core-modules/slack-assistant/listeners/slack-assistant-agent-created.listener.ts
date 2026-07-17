import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { type AllMetadataName } from 'twenty-shared/metadata';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_ROLE_ASSIGNMENT_JOB_NAME,
} from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { type SlackAssistantRoleAssignmentJobData } from 'src/engine/core-modules/slack-assistant/types/slack-assistant-role-assignment-job.type';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';

// When the slack-assistant agent is synced into a workspace (fresh install or
// upgrade), enqueue a retryable job to grant it the shipped read-only role.
// Enqueuing (rather than assigning inline) keeps provisioning off the fire-and-
// forget event path: the queue retries transient failures instead of losing the
// assignment.
@Injectable()
export class SlackAssistantAgentCreatedListener {
  constructor(
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('metadata.agent.created')
  async handleAgentCreated(
    batch: MetadataEventBatch<AllMetadataName, 'created'>,
  ): Promise<void> {
    const slackAssistantAgentIds = batch.events
      .filter(
        (event) =>
          'after' in event.properties &&
          event.properties.after.universalIdentifier ===
            SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      )
      .map((event) => event.recordId);

    for (const agentId of slackAssistantAgentIds) {
      await this.messageQueueService.add<SlackAssistantRoleAssignmentJobData>(
        SLACK_ASSISTANT_ROLE_ASSIGNMENT_JOB_NAME,
        { workspaceId: batch.workspaceId, agentId },
        { retryLimit: 3 },
      );
    }
  }
}
