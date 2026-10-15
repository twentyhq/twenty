import { AgentRunSettlementService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-settlement.service';

const buildService = (get: () => Promise<string | null>) =>
  new AgentRunSettlementService({
    getClient: () => ({ get: jest.fn(get) }),
  } as never);

describe('AgentRunSettlementService', () => {
  it('reads how the run settled once it is stored', async () => {
    const payloads = [
      null,
      JSON.stringify({ status: 'COMPLETED', result: {}, error: null }),
    ];
    const service = buildService(async () => payloads.shift() ?? null);

    const settledRun = service.waitFor({ runId: 'run-id', timeoutMs: 60_000 });

    await jest.advanceTimersByTimeAsync(1_000);

    await expect(settledRun).resolves.toMatchObject({ status: 'COMPLETED' });
  });

  // Redis queues commands while it is down, so they neither resolve nor fail
  it('stops waiting at the deadline while Redis is down', async () => {
    const service = buildService(() => new Promise<never>(() => {}));

    const settledRun = service.waitFor({ runId: 'run-id', timeoutMs: 60_000 });

    await jest.advanceTimersByTimeAsync(61_000);

    await expect(settledRun).resolves.toBeNull();
  });
});
