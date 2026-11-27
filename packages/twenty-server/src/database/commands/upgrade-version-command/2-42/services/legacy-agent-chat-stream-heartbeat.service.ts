import { Injectable } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class LegacyAgentChatStreamHeartbeatService {
  constructor(private readonly redisClientService: RedisClientService) {}

  async isAlive(streamId: string): Promise<boolean> {
    try {
      const exists = await this.redisClientService
        .getClient()
        .exists(`agent-chat-stream-alive:${streamId}`);

      return exists === 1;
    } catch {
      return true;
    }
  }
}
