import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

const THREAD_SUBSCRIPTION_TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class SlackThreadSubscriptionService {
  constructor(private readonly redisClientService: RedisClientService) {}

  async subscribe({
    teamId,
    channelId,
    threadTs,
  }: {
    teamId: string;
    channelId: string;
    threadTs: string;
  }): Promise<void> {
    await this.redisClientService
      .getClient()
      .set(
        this.getKey({ teamId, channelId, threadTs }),
        '1',
        'EX',
        THREAD_SUBSCRIPTION_TTL_SECONDS,
      );
  }

  async isSubscribed({
    teamId,
    channelId,
    threadTs,
  }: {
    teamId: string;
    channelId: string;
    threadTs: string;
  }): Promise<boolean> {
    const value = await this.redisClientService
      .getClient()
      .get(this.getKey({ teamId, channelId, threadTs }));

    return isDefined(value);
  }

  private getKey({
    teamId,
    channelId,
    threadTs,
  }: {
    teamId: string;
    channelId: string;
    threadTs: string;
  }): string {
    return `slack-assistant:thread:${teamId}:${channelId}:${threadTs}`;
  }
}
