import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';

import type { Redis } from 'ioredis';
import { isDefined } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { RUN_AGENT_SETTLED_RUN_RECONCILE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-settled-run-reconcile-interval-ms.const';
import { RUN_AGENT_SETTLED_RUN_TTL_SECONDS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-settled-run-ttl-seconds.const';
import { type SettledAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/settled-agent-run.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';

const getSettledRunKey = (runId: string) => `agent-run-settled:${runId}`;

// One subscriber connection per process carries every waiting call's channel
@Injectable()
export class AgentRunSettlementService implements OnModuleDestroy {
  private readonly logger = new Logger(AgentRunSettlementService.name);
  private subscriber: Redis | null = null;
  private readonly waiters = new Map<
    string,
    (settledRun: SettledAgentRun) => void
  >();

  constructor(private readonly redisClientService: RedisClientService) {}

  async publish({
    runId,
    settledRun,
  }: {
    runId: string;
    settledRun: SettledAgentRun;
  }): Promise<void> {
    const key = getSettledRunKey(runId);
    const payload = JSON.stringify(settledRun);

    await this.redisClientService
      .getClient()
      .multi()
      .set(key, payload, 'EX', RUN_AGENT_SETTLED_RUN_TTL_SECONDS)
      .publish(key, payload)
      .exec();
  }

  // Redis queues commands while it is down, so only the timer decides when the call stops waiting
  async waitFor({
    runId,
    timeoutMs,
  }: {
    runId: string;
    timeoutMs: number;
  }): Promise<SettledAgentRun | null> {
    const key = getSettledRunKey(runId);
    let timeout: NodeJS.Timeout | undefined;

    const settledRun = new Promise<SettledAgentRun | null>((resolve) => {
      this.waiters.set(key, resolve);
      timeout = setTimeout(() => resolve(null), timeoutMs);
    });

    const readStoredSettlement = () =>
      this.redisClientService
        .getClient()
        .get(key)
        .then((payload) => {
          if (isDefined(payload)) {
            this.waiters.get(key)?.(JSON.parse(payload) as SettledAgentRun);
          }
        })
        .catch((error: unknown) =>
          this.logger.warn(
            `Could not read how run ${runId} settled: ${formatErrorWithCause(error)}`,
          ),
        );

    // a run that settled before the subscription took is read from its key
    this.ensureSubscriber()
      .subscribe(key)
      .then(readStoredSettlement)
      .catch((error: unknown) =>
        this.logger.warn(
          `Could not wait for run ${runId} to settle: ${formatErrorWithCause(error)}`,
        ),
      );

    const reconcile = setInterval(
      () => void readStoredSettlement(),
      RUN_AGENT_SETTLED_RUN_RECONCILE_INTERVAL_MS,
    );

    try {
      return await settledRun;
    } finally {
      clearTimeout(timeout);
      clearInterval(reconcile);
      this.waiters.delete(key);
      this.subscriber?.unsubscribe(key).catch(() => {});
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber?.quit().catch(() => {});
    this.subscriber = null;
  }

  private ensureSubscriber(): Redis {
    if (!isDefined(this.subscriber)) {
      this.subscriber = this.redisClientService.getClient().duplicate();
      this.subscriber.on('message', (channel: string, payload: string) =>
        this.waiters.get(channel)?.(JSON.parse(payload) as SettledAgentRun),
      );
    }

    return this.subscriber;
  }
}
