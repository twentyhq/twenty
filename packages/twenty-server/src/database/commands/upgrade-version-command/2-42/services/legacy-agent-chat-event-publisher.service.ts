import { Injectable } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

type LegacyAgentChatStreamErrorEvent = {
  type: 'stream-error';
  code: string;
  message: string;
};

@Injectable()
export class LegacyAgentChatEventPublisherService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly redisClientService: RedisClientService,
  ) {}

  async resetStreamState(threadId: string): Promise<void> {
    await this.redisClientService
      .getClient()
      .del(`agent-chat-stream-chunks:${threadId}`);
  }

  async publish({
    threadId,
    workspaceId,
    event,
  }: {
    threadId: string;
    workspaceId: string;
    event: LegacyAgentChatStreamErrorEvent;
  }): Promise<void> {
    await this.subscriptionService.publishToAgentChat({
      workspaceId,
      threadId,
      payload: { onAgentChatEvent: { threadId, event } },
    });
  }
}
