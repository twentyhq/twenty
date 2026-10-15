import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { RUN_AGENT_SETTLED_RUN_POLL_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-settled-run-poll-interval-ms.const';
import { RUN_AGENT_SETTLED_RUN_TTL_SECONDS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-settled-run-ttl-seconds.const';
import { type SettledAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/settled-agent-run.type';

const getSettledRunKey = (runId: string) => `agent-run-settled:${runId}`;

const waitAtMost = <TValue>({
  promise,
  timeoutMs,
}: {
  promise: Promise<TValue>;
  timeoutMs: number;
}): Promise<TValue | null> =>
  Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);

@Injectable()
export class AgentRunSettlementService {
  private readonly logger = new Logger(AgentRunSettlementService.name);

  constructor(private readonly redisClientService: RedisClientService) {}

  async publish({
    runId,
    settledRun,
  }: {
    runId: string;
    settledRun: SettledAgentRun;
  }): Promise<void> {
    await this.redisClientService
      .getClient()
      .set(
        getSettledRunKey(runId),
        JSON.stringify(settledRun),
        'EX',
        RUN_AGENT_SETTLED_RUN_TTL_SECONDS,
      );
  }

  async waitFor({
    runId,
    timeoutMs,
  }: {
    runId: string;
    timeoutMs: number;
  }): Promise<SettledAgentRun | null> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      // Redis queues commands while it is down, so a read cannot hold the call past its deadline
      const settledRun = await waitAtMost({
        promise: this.read(runId),
        timeoutMs: deadline - Date.now(),
      });

      if (isDefined(settledRun)) {
        return settledRun;
      }

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(
            RUN_AGENT_SETTLED_RUN_POLL_INTERVAL_MS,
            deadline - Date.now(),
          ),
        ),
      );
    }

    return null;
  }

  private async read(runId: string): Promise<SettledAgentRun | null> {
    try {
      const payload = await this.redisClientService
        .getClient()
        .get(getSettledRunKey(runId));

      return isDefined(payload)
        ? (JSON.parse(payload) as SettledAgentRun)
        : null;
    } catch (error) {
      this.logger.warn(
        `Could not read how run ${runId} settled: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }
}
