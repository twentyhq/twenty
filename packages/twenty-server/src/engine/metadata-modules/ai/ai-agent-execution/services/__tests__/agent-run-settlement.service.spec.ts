import { AgentRunSettlementService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-settlement.service';

const neverSettles = () => new Promise<never>(() => {});

// Redis queues commands while it is down, so they neither resolve nor fail
const buildServiceWithRedisDown = () => {
  const subscriber = {
    on: jest.fn(),
    subscribe: jest.fn(neverSettles),
    unsubscribe: jest.fn(neverSettles),
  };
  const client = {
    duplicate: () => subscriber,
    get: jest.fn(neverSettles),
  };

  return new AgentRunSettlementService({ getClient: () => client } as never);
};

describe('AgentRunSettlementService', () => {
  it('stops waiting at the deadline while Redis is down', async () => {
    const service = buildServiceWithRedisDown();
    const start = jest.fn().mockResolvedValue(undefined);

    const settledRun = service.waitFor({
      runId: 'run-id',
      timeoutMs: 60_000,
      start,
    });

    await jest.advanceTimersByTimeAsync(60_000);

    await expect(settledRun).resolves.toBeNull();
    expect(start).toHaveBeenCalledTimes(1);
  });
});
