import { Injectable, type OnModuleDestroy } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import type { Redis } from 'ioredis';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import {
  RUN_AGENT_SETTLED_RUN_POLL_INTERVAL_MS,
  RUN_AGENT_SETTLED_RUN_TTL_SECONDS,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-wait.const';
import { type SettledAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/settled-agent-run.type';

const getSettledRunKey = (runId: string) => `agent-run-settled:${runId}`;

// How a runAgent call that waits learns how its run, going on in a job, settled. The settlement is
// stored as well as published, so a call that subscribed late or missed the message still reads it.
// One subscriber connection per process serves every waiting call
@Injectable()
export class AgentRunSettlementService implements OnModuleDestroy {
  private subscriber: Redis | null = null;
  private readonly listeners = new Map<
    string,
    (settledRun: SettledAgentRun) => void
  >();

  constructor(private readonly redisClientService: RedisClientService) {}

  async publish(runId: string, settledRun: SettledAgentRun): Promise<void> {
    const key = getSettledRunKey(runId);
    const payload = JSON.stringify(settledRun);
    const redis = this.redisClientService.getClient();

    await redis.set(key, payload, 'EX', RUN_AGENT_SETTLED_RUN_TTL_SECONDS);
    await redis.publish(key, payload);
  }

  // resolves null once the run has gone on longer than the call waits
  async waitFor({
    runId,
    timeoutMs,
    start,
  }: {
    runId: string;
    timeoutMs: number;
    // what starts the run, called once the settlement is listened to
    start: () => Promise<void>;
  }): Promise<SettledAgentRun | null> {
    const key = getSettledRunKey(runId);
    let resolveSettledRun: (
      settledRun: SettledAgentRun | null,
    ) => void = () => {};
    const settledRunPromise = new Promise<SettledAgentRun | null>((resolve) => {
      resolveSettledRun = resolve;
    });

    this.listeners.set(key, resolveSettledRun);
    await this.ensureSubscriber().subscribe(key);

    const pollInterval = setInterval(() => {
      void this.read(key).then((settledRun) => {
        if (isDefined(settledRun)) {
          resolveSettledRun(settledRun);
        }
      });
    }, RUN_AGENT_SETTLED_RUN_POLL_INTERVAL_MS);
    const timeout = setTimeout(() => resolveSettledRun(null), timeoutMs);

    try {
      await start();

      return await settledRunPromise;
    } finally {
      clearInterval(pollInterval);
      clearTimeout(timeout);
      this.listeners.delete(key);
      await this.subscriber?.unsubscribe(key).catch(() => {});
    }
  }

  private async read(key: string): Promise<SettledAgentRun | null> {
    const payload = await this.redisClientService
      .getClient()
      .get(key)
      .catch(() => null);

    return isDefined(payload) ? (JSON.parse(payload) as SettledAgentRun) : null;
  }

  private ensureSubscriber(): Redis {
    if (!isDefined(this.subscriber)) {
      this.subscriber = this.redisClientService.getClient().duplicate();
      this.subscriber.on('message', (channel: string, payload: string) => {
        this.listeners.get(channel)?.(JSON.parse(payload) as SettledAgentRun);
      });
    }

    return this.subscriber;
  }

  async onModuleDestroy(): Promise<void> {
    if (isDefined(this.subscriber)) {
      await this.subscriber.quit().catch(() => {});
      this.subscriber = null;
    }

    this.listeners.clear();
  }
}
